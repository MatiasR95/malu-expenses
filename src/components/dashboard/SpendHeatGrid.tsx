import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { useMonthAnalytics } from '../../lib/analytics';
import { formatARS } from '../../utils/currency';
import { EASE_OUT } from '../../lib/motion';

/**
 * The month as a calendar of intensity.
 *
 * The trace answers "what is the balance"; this answers "when do we spend".
 * Every day of the month is a cell shaded against the heaviest day, so weekend
 * clusters, the rent day and the quiet stretches are all visible at once --
 * none of which survives being averaged into a monthly total.
 *
 * Shading alone would carry the data for anyone who can see it and nobody who
 * cannot, so each cell keeps its day number, is focusable, and reports its own
 * figure through a title and the readout strip.
 */
export const SpendHeatGrid: React.FC = () => {
  const { incomes, expenses, selectedMonth, userFilter, categories } = useFinance();
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  const a = useMonthAnalytics({ incomes, expenses, selectedMonth, userFilter }, categories);
  const peak = Math.max(...a.days.map((d) => d.spend), 0);

  if (peak === 0) return null;

  // Lead the grid with blanks so day 1 lands on its real weekday.
  const firstWeekday = (new Date(a.shape.year, a.shape.month - 1, 1).getDay() + 6) % 7;
  const active = hovered != null ? a.days[hovered - 1] : null;

  return (
    <section className="px-5 py-5">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/60">
          Spending calendar
        </h2>
        <p className="text-[9px] font-mono uppercase tracking-[0.12em] tabular text-white/75">
          {active
            ? `${String(active.day).padStart(2, '0')} · ${active.spend > 0 ? formatARS(active.spend, { compact: true }) : 'nothing'}`
            : `Peak ${formatARS(peak, { compact: true })}`}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1" role="group" aria-label="Daily spending intensity">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="text-center text-[8px] font-mono uppercase tracking-[0.1em] text-white/35 pb-0.5"
          >
            {d}
          </span>
        ))}

        {Array.from({ length: firstWeekday }, (_, i) => (
          <span key={`pad-${i}`} aria-hidden="true" />
        ))}

        {a.days.map((d, i) => {
          const intensity = d.spend / peak;
          const isFuture = !d.elapsed;
          return (
            <motion.button
              key={d.day}
              type="button"
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32, ease: EASE_OUT, delay: Math.min(i, 31) * 0.012 }}
              onHoverStart={() => setHovered(d.day)}
              onHoverEnd={() => setHovered(null)}
              onFocus={() => setHovered(d.day)}
              onBlur={() => setHovered(null)}
              onClick={() => setHovered((h) => (h === d.day ? null : d.day))}
              title={`${String(d.day).padStart(2, '0')} — ${d.spend > 0 ? formatARS(d.spend) : 'no spending'}`}
              aria-label={`Day ${d.day}, ${d.spend > 0 ? formatARS(d.spend) : 'no spending'}`}
              className={`relative aspect-square flex items-center justify-center text-[9px] font-mono tabular transition-[outline-color] ${
                hovered === d.day ? 'outline outline-2 outline-[var(--color-mustard)]' : ''
              } ${isFuture ? 'text-white/20' : intensity > 0.55 ? 'text-[var(--color-ink)]' : 'text-white/70'}`}
              style={{
                backgroundColor: isFuture
                  ? 'rgba(255,255,255,0.03)'
                  : d.spend === 0
                    ? 'rgba(255,255,255,0.07)'
                    : `color-mix(in srgb, var(--color-mustard) ${18 + intensity * 82}%, transparent)`,
              }}
            >
              {d.day}
            </motion.button>
          );
        })}
      </div>

      {/* Scale legend. Shading is meaningless without one. */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[8px] font-mono uppercase tracking-[0.14em] text-white/40">
          Light
        </span>
        <span className="flex gap-px flex-1 max-w-[7rem]" aria-hidden="true">
          {[0.15, 0.35, 0.55, 0.78, 1].map((step) => (
            <span
              key={step}
              className="h-2 flex-1"
              style={{
                backgroundColor: `color-mix(in srgb, var(--color-mustard) ${18 + step * 82}%, transparent)`,
              }}
            />
          ))}
        </span>
        <span className="text-[8px] font-mono uppercase tracking-[0.14em] text-white/40">
          Heavy
        </span>
        <span className="ml-auto text-[8px] font-mono uppercase tracking-[0.14em] text-white/40">
          {a.noSpendDays} quiet {a.noSpendDays === 1 ? 'day' : 'days'}
        </span>
      </div>
    </section>
  );
};
