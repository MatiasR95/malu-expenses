import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { buildMonthHistory } from '../../lib/analytics';
import { formatARS } from '../../utils/currency';
import { PRESS } from '../../lib/motion';

/**
 * Six months of in-versus-out, paired bars.
 *
 * Until now nothing in the app looked further back than the month you were
 * standing in, so there was no way to tell a heavy month from a normal one.
 * Income and spend are drawn as a pair per month against a shared scale --
 * stacking them would hide the gap, which is the entire point of the picture.
 *
 * Tapping a month switches the whole app to it, so the chart is navigation as
 * well as history.
 */
export const MonthHistoryBars: React.FC = () => {
  const { incomes, expenses, selectedMonth, setSelectedMonth, userFilter } = useFinance();
  const [focused, setFocused] = useState<string | null>(null);

  const bars = useMemo(
    () => buildMonthHistory(incomes, expenses, selectedMonth, userFilter, 6),
    [incomes, expenses, selectedMonth, userFilter]
  );

  const peak = Math.max(...bars.flatMap((b) => [b.income, b.spend]), 1);
  const withData = bars.filter((b) => b.income > 0 || b.spend > 0);
  if (withData.length < 2) return null;

  const shown = bars.find((b) => b.monthKey === (focused ?? selectedMonth)) ?? bars[bars.length - 1];

  return (
    <section className="px-5 py-5 rule-light">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/60">
          Six-month history
        </h2>
        <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-[0.1em] text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[var(--color-mustard)]" aria-hidden="true" /> In
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[var(--color-terracotta)]" aria-hidden="true" /> Out
          </span>
        </div>
      </div>

      {/* Readout above the bars, so the figure never depends on a tooltip. */}
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] tabular text-white/80 mb-3">
        {shown.label} · in {formatARS(shown.income, { compact: true })} · out{' '}
        {formatARS(shown.spend, { compact: true })} ·{' '}
        <span className={shown.net < 0 ? 'text-[var(--color-terracotta)]' : 'text-[var(--color-mustard)]'}>
          net {formatARS(shown.net, { compact: true })}
        </span>
      </p>

      <ul className="flex items-end gap-2 h-28">
        {bars.map((b, i) => {
          const isCurrent = b.monthKey === selectedMonth;
          return (
            <li key={b.monthKey} className="flex-1 h-full flex flex-col justify-end">
              <motion.button
                type="button"
                whileTap={PRESS}
                onClick={() => setSelectedMonth(b.monthKey)}
                onHoverStart={() => setFocused(b.monthKey)}
                onHoverEnd={() => setFocused(null)}
                onFocus={() => setFocused(b.monthKey)}
                onBlur={() => setFocused(null)}
                aria-label={`${b.label}: in ${formatARS(b.income)}, out ${formatARS(b.spend)}`}
                aria-current={isCurrent ? 'true' : undefined}
                className="group w-full h-full flex flex-col justify-end gap-1.5"
              >
                <span className="flex items-end justify-center gap-[3px] h-full">
                  <span
                    style={
                      {
                        height: `${Math.max(2, (b.income / peak) * 100)}%`,
                        '--i': i,
                      } as React.CSSProperties
                    }
                    className={`grow-y w-1/2 max-w-[14px] bg-[var(--color-mustard)] transition-opacity ${
                      isCurrent ? 'opacity-100' : 'opacity-45 group-hover:opacity-75'
                    }`}
                  />
                  <span
                    style={
                      {
                        height: `${Math.max(2, (b.spend / peak) * 100)}%`,
                        '--i': i,
                        '--delay': '160ms',
                      } as React.CSSProperties
                    }
                    className={`grow-y w-1/2 max-w-[14px] bg-[var(--color-terracotta)] transition-opacity ${
                      isCurrent ? 'opacity-100' : 'opacity-45 group-hover:opacity-75'
                    }`}
                  />
                </span>
                <span
                  className={`text-[8px] font-mono uppercase tracking-[0.1em] text-center ${
                    isCurrent ? 'text-[var(--color-mustard)] font-bold' : 'text-white/40'
                  }`}
                >
                  {b.label}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
