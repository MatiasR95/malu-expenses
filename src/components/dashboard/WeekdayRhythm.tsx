import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { buildWeekdayRhythm } from '../../lib/analytics';
import { formatARS } from '../../utils/currency';

const FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Which days of the week the money actually leaves.
 *
 * Household spending has a shape -- a Saturday shop, a Friday dinner -- and it
 * is invisible in a chronological ledger. Seven horizontal bars is the whole
 * chart: horizontal because the labels are words, and words in a vertical bar
 * chart end up rotated, which is the fastest way to make a small chart
 * unreadable on a phone.
 */
export const WeekdayRhythm: React.FC = () => {
  const { expenses, selectedMonth, userFilter } = useFinance();

  const cells = useMemo(
    () => buildWeekdayRhythm(expenses, selectedMonth, userFilter),
    [expenses, selectedMonth, userFilter]
  );

  const total = cells.reduce((s, c) => s + c.total, 0);
  if (total === 0) return null;

  const heaviest = cells.reduce((a, b) => (b.total > a.total ? b : a));

  return (
    <section className="px-5 py-5 rule-light">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/60">
          Weekly rhythm
        </h2>
        <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-white/75">
          Heaviest · {FULL[heaviest.index]}
        </p>
      </div>

      <ul className="flex flex-col gap-1.5">
        {cells.map((c, i) => (
          <li key={c.index} className="flex items-center gap-2.5">
            <span className="w-16 shrink-0 text-[9px] font-mono uppercase tracking-[0.12em] text-white/50">
              {FULL[c.index].slice(0, 3)}
            </span>
            <span className="relative flex-1 h-4 bg-white/[0.06]">
              <span
                style={{ '--grow-to': c.intensity, '--i': i } as React.CSSProperties}
                className={`grow-x absolute inset-0 ${
                  c.index === heaviest.index
                    ? 'bg-[var(--color-mustard)]'
                    : 'bg-[var(--color-olive-5)]'
                }`}
              />
            </span>
            <span className="w-14 shrink-0 text-right text-[10px] font-mono tabular text-white/70">
              {c.total > 0 ? formatARS(c.total, { compact: true }) : '—'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
