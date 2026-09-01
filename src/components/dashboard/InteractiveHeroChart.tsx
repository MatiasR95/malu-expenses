import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';

const W = 300;
const H = 96;

/**
 * Running household balance across the current month.
 *
 * This chart used to plot `Math.random()` -- it reshuffled on every render and
 * told you nothing. It now walks the real ledger day by day, so the line is the
 * actual balance you had on the 4th, the 9th, the 14th. Drag along it to read
 * any day.
 */
export const InteractiveHeroChart: React.FC = () => {
  const { incomes, expenses, selectedMonth, userFilter } = useFinance();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const series = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    const dayOf = (iso: string) => Number(iso.slice(8, 10));

    const monthIncomes = incomes.filter((i) => i.date.startsWith(selectedMonth));
    const monthExpenses = expenses
      .filter((e) => e.date.startsWith(selectedMonth))
      .filter((e) => userFilter === 'all' || e.loggedBy === userFilter);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === y && today.getMonth() + 1 === m;
    /* Run to today, but never stop short of the newest row on the books --
       otherwise a ledger holding entries dated later in the month (a rent
       debit posted ahead, or seeded sample data) plots two points and fills
       the rest of the box with flat wash. */
    const latestEntry = Math.max(
      0,
      ...monthIncomes.map((i) => dayOf(i.date)),
      ...monthExpenses.map((e) => dayOf(e.date))
    );
    const lastDay = Math.min(
      daysInMonth,
      Math.max(isCurrentMonth ? today.getDate() : daysInMonth, latestEntry)
    );

    let running = 0;
    const pts: { day: number; value: number }[] = [];
    for (let d = 1; d <= Math.max(lastDay, 2); d++) {
      running += monthIncomes.filter((i) => dayOf(i.date) === d).reduce((s, i) => s + i.amount, 0);
      running -= monthExpenses.filter((e) => dayOf(e.date) === d).reduce((s, e) => s + e.amount, 0);
      pts.push({ day: d, value: running });
    }
    return pts;
  }, [incomes, expenses, selectedMonth, userFilter]);

  const { points, pathD, areaD, hasData, isFlat } = useMemo(() => {
    const values = series.map((p) => p.value);
    /* Anchor the domain to zero. Scaling to the data's own min/max pins the
       first point to the floor and the last to the ceiling, which made a
       two-point month look like a cliff and left the area fill covering the
       whole box. With zero in range the line sits where the money actually
       is. */
    const rawMax = Math.max(...values);
    const rawMin = Math.min(...values);
    const flat = rawMax === rawMin;

    /* Scale to the balance's own range with 15% padding at each end.
       Forcing zero into the domain flattened every real month against the top
       of the frame -- a balance that moves between 1.08M and 1.45M has all its
       shape in that 25%, and anchoring to zero throws it away. Padding both
       ends keeps the trace off the edges without pinning it. */
    const pad = flat ? 0 : (rawMax - rawMin) * 0.15;
    const max = rawMax + pad;
    const min = rawMin - pad;
    const span = max - min || 1;
    const y = (v: number) => (flat ? H * 0.45 : H - 8 - ((v - min) / span) * (H - 16));

    const pts = series.map((p, i) => ({
      ...p,
      x: series.length > 1 ? (i / (series.length - 1)) * W : 0,
      y: y(p.value),
    }));

    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    return {
      points: pts,
      pathD: d,
      areaD: `${d} L ${W},${H} L 0,${H} Z`,
      hasData: series.some((p) => p.value !== 0),
      isFlat: flat,
    };
  }, [series]);

  const readIndexFromEvent = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    return Math.min(Math.max(Math.round(pct * (points.length - 1)), 0), points.length - 1);
  };

  const active = activeIndex !== null ? points[activeIndex] : null;

  if (!hasData) {
    return (
      <div className="w-full h-28 flex items-center justify-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)]">
          Balance trace appears once this month has activity
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {/* Readout. Fixed height so the chart never jumps as the label swaps. */}
      <div className="h-8 px-5 mb-1 flex items-center">
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
                Day {active.day}
              </span>
              <span className="font-display font-semibold text-sm tabular">
                ${Math.round(active.value).toLocaleString('en-US')}
              </span>
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
              Balance this month · drag to read a day
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className={isFlat ? 'w-full h-14' : 'w-full h-28'}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-full touch-none"
          role="img"
          aria-label={`Running balance for ${series.length} days this month`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setActiveIndex(readIndexFromEvent(e));
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) setActiveIndex(readIndexFromEvent(e));
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId);
            setActiveIndex(null);
          }}
          onPointerCancel={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0" />
            </linearGradient>

            {/* Left-to-right wipe.
                The trace used to draw with framer's `pathLength`, which works
                by writing a normalised stroke-dasharray. Under
                preserveAspectRatio="none" plus non-scaling-stroke that dash
                pattern is measured in unscaled user units, so the line came
                out as a solid stub that simply stopped partway across. A clip
                rect is immune to how the viewBox is stretched. */}
            <clipPath id="heroReveal">
              <rect
                x="0"
                y="0"
                height={H}
                width={W}
                className="reveal-wipe"
                style={{ '--wipe-to': `${W}px` } as React.CSSProperties}
              />
            </clipPath>
          </defs>

          <g clipPath="url(#heroReveal)">
            <path d={areaD} fill="url(#heroArea)" />
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {active && (
            <line
              x1={active.x} y1={active.y} x2={active.x} y2={H}
              stroke="var(--color-ink)" strokeWidth="1" strokeDasharray="3 3"
              opacity="0.35" vectorEffect="non-scaling-stroke"
            />
          )}

          {points.map((p, i) => {
            const isActive = activeIndex === i;
            return (
              <circle
                key={p.day}
                cx={p.x}
                cy={p.y}
                /* `r` lives on the element, not only inside `animate` -- the
                   old version left it undefined on first paint, which SVG
                   rejects and the console logged once per node. */
                r={isActive ? 5 : 2}
                fill={isActive ? 'var(--color-mustard)' : 'var(--color-ink)'}
                stroke={isActive ? 'var(--color-ink)' : 'none'}
                strokeWidth={isActive ? 2 : 0}
                vectorEffect="non-scaling-stroke"
                className="pointer-events-none transition-[r] duration-150"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
