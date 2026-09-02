import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { useMonthAnalytics } from '../../lib/analytics';
import { formatARS } from '../../utils/currency';
import { tick } from '../../utils/haptics';

/* Uniform viewBox -- deliberately NOT preserveAspectRatio="none".
   The old trace stretched a 300x96 box to whatever width the phone had, which
   turned every data dot into an ellipse and, on a two-point month, drew the
   line corner to corner across the full bleed with nothing around it to say
   what the corners meant. Scaling uniformly keeps the marks round and the
   gradient honest. */
const W = 320;
const H = 150;
const PAD = { top: 14, right: 12, bottom: 22, left: 12 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/**
 * Running household balance across the month, with the rest of the month
 * projected at the current burn rate.
 *
 * Three things the previous chart did not say, all of which a household
 * actually asks: where does zero sit, where is today, and if nothing changes,
 * where does the month end? The solid trace is what happened; the dashed
 * continuation is the forecast. Drag anywhere to read a day.
 */
export const BalanceTrace: React.FC = () => {
  const { incomes, expenses, selectedMonth, userFilter, categories } = useFinance();
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const a = useMonthAnalytics({ incomes, expenses, selectedMonth, userFilter }, categories);

  const chart = useMemo(() => {
    /* Draw everything on the books, not only what has elapsed. A row dated
       later this month is money already committed; hiding it would make the
       trace end somewhere other than the headline figure above it. */
    const real = a.bookedDays;
    if (real.length === 0) return null;

    const endBalance = real[real.length - 1].balance;
    const daysLeft = a.shape.daysInMonth - a.bookedThrough;
    const projectedEnd = endBalance - a.avgDailySpend * daysLeft;

    /* The domain is set by the *record* plus zero, and only then stretched a
       little for the forecast.
       Letting the projection set the scale outright was worse than not drawing
       it: a rough early-month rate that extrapolates to minus two million
       squashes every real day of the month into a flat line across the top of
       the box, so the picture you can verify is destroyed by the picture you
       cannot. The forecast may pull the floor down by at most 60% of the
       trace's own range; past that it runs off-scale and says so, and the
       exact figure is printed underneath either way. */
    const realHi = Math.max(...real.map((d) => d.balance));
    const realLo = Math.min(...real.map((d) => d.balance));
    const realRange = realHi - realLo || Math.abs(realHi) || 1;

    let hi = Math.max(realHi, Math.min(projectedEnd, realHi + realRange * 0.6));
    let lo = Math.min(realLo, Math.max(projectedEnd, realLo - realRange * 0.6));

    // Zero enters the frame once the money comes anywhere near it.
    const showZero = lo <= 0 || lo < Math.abs(hi) * 0.4;
    if (showZero) {
      hi = Math.max(hi, 0);
      lo = Math.min(lo, 0);
    }

    const pad = (hi - lo) * 0.18 || Math.abs(hi) * 0.2 || 1;
    const max = hi + pad;
    const min = lo - pad;
    const span = max - min || 1;

    const y = (v: number) => PAD.top + PLOT_H - ((v - min) / span) * PLOT_H;
    const x = (day: number) =>
      PAD.left + ((day - 1) / Math.max(1, a.shape.daysInMonth - 1)) * PLOT_W;

    const pts = real.map((d) => ({ ...d, x: x(d.day), y: y(d.balance) }));

    /* A single-day month has no line to draw. Give it a two-point stub from
       the left edge so the mark has somewhere to sit and the reader can see
       the day is day one, rather than a lone dot floating in an empty box. */
    const linePts = pts.length > 1 ? pts : [{ ...pts[0], x: PAD.left }, pts[0]];
    const pathD = linePts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(' ');

    const last = pts[pts.length - 1];
    const floorY = PAD.top + PLOT_H;

    // Clamp the drawn endpoint into the plot; `offScale` tells the UI to mark
    // it rather than silently pretending the forecast lands on the floor.
    const rawEndY = y(projectedEnd);
    const endY = Math.min(Math.max(rawEndY, PAD.top), floorY);
    const offScale = rawEndY > floorY + 0.5;

    const forecastD =
      daysLeft > 0
        ? `M ${last.x.toFixed(2)},${last.y.toFixed(2)} L ${x(a.shape.daysInMonth).toFixed(2)},${endY.toFixed(2)}`
        : null;
    return {
      pts,
      pathD,
      areaD: `${pathD} L ${last.x.toFixed(2)},${floorY} L ${linePts[0].x.toFixed(2)},${floorY} Z`,
      forecastD,
      projectedEnd,
      zeroY: min <= 0 && max >= 0 ? y(0) : null,
      endX: x(a.shape.daysInMonth),
      endY,
      offScale,
      floorY,
    };
  }, [a]);

  if (!a.hasActivity || !chart) {
    return (
      <div className="px-5">
        <div className="w-full h-32 border border-dashed border-[var(--color-ink)]/20 flex flex-col items-center justify-center gap-2 text-center px-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)]">
            No trace yet
          </p>
          <p className="text-[11px] text-[var(--color-ink-3)] max-w-[24ch] leading-snug">
            Log a transaction and this fills in with your running balance, day by day.
          </p>
        </div>
      </div>
    );
  }

  const active = activeIndex !== null ? chart.pts[activeIndex] : null;

  const readIndexFromEvent = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Map the pointer back through the padded plot area, not the raw box, so
    // the first and last day are reachable at the very edges of the drag.
    const pct = ((e.clientX - rect.left) / rect.width - PAD.left / W) / (PLOT_W / W);
    const day = Math.round(pct * (a.shape.daysInMonth - 1)) + 1;
    const idx = chart.pts.findIndex((p) => p.day >= day);
    return Math.min(Math.max(idx === -1 ? chart.pts.length - 1 : idx, 0), chart.pts.length - 1);
  };

  /* The balance falls in every month that spends anything, so colouring the
     forecast red whenever it slopes down would make red mean "you are alive".
     It is an alarm colour, kept for the one condition that is actually an
     alarm: the month is projected to run out of money. */
  const projectionIsWorse = chart.projectedEnd < 0;

  return (
    <div className="w-full flex flex-col">
      {/* Readout. Fixed height so the chart never jumps as the label swaps. */}
      <div className="h-9 px-5 flex items-center">
        <AnimatePresence mode="wait" initial={false}>
          {active ? (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="flex items-baseline gap-2.5 bg-[var(--color-ink)] text-[var(--color-mustard)] px-3 py-1.5"
            >
              <span className="text-[9px] font-mono uppercase tracking-[0.18em] opacity-70">
                Day {String(active.day).padStart(2, '0')}
              </span>
              <span className="font-display font-semibold text-sm tabular">
                {formatARS(Math.round(active.balance))}
              </span>
              {(active.spend > 0 || active.income > 0) && (
                <span className="text-[9px] font-mono tabular text-white/60">
                  {active.income > 0 && `+${formatARS(active.income, { compact: true })}`}
                  {active.income > 0 && active.spend > 0 && ' '}
                  {active.spend > 0 && `−${formatARS(active.spend, { compact: true })}`}
                </span>
              )}
            </motion.div>
          ) : (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)]"
            >
              Balance · drag to read a day
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto touch-none select-none"
          role="img"
          aria-label={`Running balance across ${a.bookedThrough} of ${a.shape.daysInMonth} days. Currently ${formatARS(Math.round(a.net))}, projected to close at ${formatARS(Math.round(chart.projectedEnd))}.`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setActiveIndex(readIndexFromEvent(e));
            tick(6);
          }}
          onPointerMove={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            const next = readIndexFromEvent(e);
            // One tick per day crossed, not per pointer event -- a buzz on
            // every frame of a drag is a vibration, not feedback.
            setActiveIndex((prev) => {
              if (prev !== next) tick(4);
              return next;
            });
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId);
            setActiveIndex(null);
          }}
          onPointerCancel={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="traceArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0.01" />
            </linearGradient>
            <clipPath id="traceReveal">
              <rect
                x="0"
                y="0"
                height={H}
                width={W}
                className={reduce ? undefined : 'reveal-wipe'}
                style={{ '--wipe-to': `${W}px` } as React.CSSProperties}
              />
            </clipPath>
          </defs>

          {/* The month still to come. Without this the box just looks empty
              early in the month -- shading it says "this space is the future,
              and the dashed line is our guess at it". */}
          {chart.forecastD && (
            <rect
              x={chart.pts[chart.pts.length - 1].x}
              y={PAD.top}
              width={W - PAD.right - chart.pts[chart.pts.length - 1].x}
              height={PLOT_H}
              fill="var(--color-ink)"
              fillOpacity="0.035"
            />
          )}

          {/* Frame: top and bottom rules only. A full box would fight the
              app's rule-and-baseline grammar; two hairlines are enough to say
              where the plot area starts and stops. */}
          <line
            x1={PAD.left} y1={PAD.top} x2={W - PAD.right} y2={PAD.top}
            stroke="var(--color-ink)" strokeOpacity="0.1" strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={PAD.left} y1={chart.floorY} x2={W - PAD.right} y2={chart.floorY}
            stroke="var(--color-ink)" strokeOpacity="0.14" strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />

          {/* Zero: the line you must not cross. Terracotta, because in this
              system terracotta always means outflow/danger. */}
          {chart.zeroY !== null && (
            <>
              <line
                x1={PAD.left} y1={chart.zeroY} x2={W - PAD.right} y2={chart.zeroY}
                stroke="var(--color-terracotta-dp)" strokeWidth="1" strokeDasharray="2 4"
                strokeOpacity="0.7" vectorEffect="non-scaling-stroke"
              />
              <text
                x={W - PAD.right} y={chart.zeroY - 4} textAnchor="end"
                className="font-mono" fontSize="7" letterSpacing="1"
                fill="var(--color-terracotta-dp)" opacity="0.85"
              >
                ZERO
              </text>
            </>
          )}

          <g clipPath="url(#traceReveal)">
            <path d={chart.areaD} fill="url(#traceArea)" />

            {/* Forecast first, so the solid record of what happened always
                draws over the guess. */}
            {chart.forecastD && (
              <path
                d={chart.forecastD}
                fill="none"
                stroke={projectionIsWorse ? 'var(--color-terracotta-dp)' : 'var(--color-mustard-dp)'}
                strokeWidth="2"
                strokeDasharray="4 3.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            <path
              d={chart.pathD}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {/* Today: the seam between record and forecast. */}
          {chart.forecastD && (
            <line
              x1={chart.pts[chart.pts.length - 1].x}
              y1={PAD.top}
              x2={chart.pts[chart.pts.length - 1].x}
              y2={chart.floorY}
              stroke="var(--color-ink)"
              strokeOpacity="0.28"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Where we stand right now — the one mark that should always be
              findable, however short the trace is. */}
          <circle
            cx={chart.pts[chart.pts.length - 1].x}
            cy={chart.pts[chart.pts.length - 1].y}
            r="3.5"
            fill="var(--color-ink)"
            stroke="var(--color-sage)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Projected landing point, or a chevron when it lands below the
              frame -- an endpoint drawn on the floor would read as "we finish
              at zero", which is a different and much nicer month. */}
          {chart.forecastD &&
            (chart.offScale ? (
              <path
                d={`M ${chart.endX - 4},${chart.floorY - 5} L ${chart.endX},${chart.floorY} L ${chart.endX + 4},${chart.floorY - 5}`}
                fill="none"
                stroke="var(--color-terracotta-dp)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : (
              <circle
                cx={chart.endX}
                cy={chart.endY}
                r="3"
                fill="var(--color-sage)"
                stroke={
                  projectionIsWorse ? 'var(--color-terracotta-dp)' : 'var(--color-mustard-dp)'
                }
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            ))}

          {/* Only mark days that actually moved money -- a dot per calendar
              day turns a 30-day month into a dotted rule and hides the days
              that matter. */}
          {chart.pts.map((p, i) => {
            const isActive = activeIndex === i;
            const moved = p.spend > 0 || p.income > 0;
            if (!moved && !isActive && i !== chart.pts.length - 1) return null;
            return (
              <circle
                key={p.day}
                cx={p.x}
                cy={p.y}
                r={isActive ? 4.5 : moved ? 2.2 : 1.6}
                fill={isActive ? 'var(--color-mustard)' : 'var(--color-ink)'}
                stroke={isActive ? 'var(--color-ink)' : 'none'}
                strokeWidth={isActive ? 1.5 : 0}
                className="pointer-events-none transition-[r] duration-150"
              />
            );
          })}

          {active && (
            <line
              x1={active.x} y1={PAD.top} x2={active.x} y2={chart.floorY}
              stroke="var(--color-ink)" strokeWidth="1" strokeDasharray="2 3"
              opacity="0.35" vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Axis feet: first day, today, last day. */}
          <text
            x={PAD.left} y={H - 7}
            className="font-mono" fontSize="7.5" letterSpacing="1.2"
            fill="var(--color-ink)" opacity="0.42"
          >
            01
          </text>
          <text
            x={W - PAD.right} y={H - 7} textAnchor="end"
            className="font-mono" fontSize="7.5" letterSpacing="1.2"
            fill="var(--color-ink)" opacity="0.42"
          >
            {a.shape.daysInMonth}
          </text>
          {/* "Today" only when it has room of its own. Near either end of the
              month it collides with the 01 / 30 feet, and two overlapping
              labels are worse than one missing one -- the seam line already
              marks the position. */}
          {a.shape.isCurrentMonth &&
            a.bookedThrough > 4 &&
            a.bookedThrough < a.shape.daysInMonth - 3 && (
              <text
                x={chart.pts[chart.pts.length - 1].x}
                y={H - 7}
                textAnchor="middle"
                className="font-mono"
                fontSize="7.5"
                letterSpacing="1.2"
                fill="var(--color-ink)"
                opacity="0.75"
                fontWeight="700"
              >
                {a.bookedThrough === a.shape.today ? 'TODAY' : 'BOOKED'}
              </text>
            )}
        </svg>
      </div>

      {/* Forecast in words. The dashed line alone does not say what it means. */}
      {chart.forecastD && (
        <div className="px-5 mt-2 flex items-center justify-between gap-3">
          <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
            Projected close · day {a.shape.daysInMonth}
            {a.forecastConfidence !== 'good' && (
              <span className="block normal-case tracking-[0.06em] opacity-70">
                {a.forecastConfidence === 'low' ? 'rough' : 'firming up'} — {a.elapsedDays.length}{' '}
                {a.elapsedDays.length === 1 ? 'day' : 'days'} of rate so far
              </span>
            )}
          </span>
          <span
            className={`font-display font-semibold text-sm tabular ${
              chart.projectedEnd < 0
                ? 'text-[var(--color-terracotta-dp)]'
                : 'text-[var(--color-ink)]'
            }`}
          >
            {formatARS(Math.round(chart.projectedEnd))}
          </span>
        </div>
      )}
    </div>
  );
};
