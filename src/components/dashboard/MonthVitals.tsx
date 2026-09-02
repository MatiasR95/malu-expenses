import React from 'react';
import { CalendarCheck, Flame, Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useMonthAnalytics } from '../../lib/analytics';
import { formatARS } from '../../utils/currency';

interface Vital {
  key: string;
  label: string;
  value: string;
  sub?: string;
  icon: typeof Flame;
  tone?: 'default' | 'warn' | 'good';
}

/**
 * Four readings the ledger already knew and never said out loud.
 *
 * These are all cheap derivations of the same month walk the trace uses --
 * average burn, the single biggest hit, how many days you managed to spend
 * nothing, and where the month lands if today's rate holds. Individually
 * trivia; together they are the difference between a list of transactions and
 * something that tells you how the month is going.
 */
export const MonthVitals: React.FC = () => {
  const { incomes, expenses, selectedMonth, userFilter, categories } = useFinance();
  const a = useMonthAnalytics({ incomes, expenses, selectedMonth, userFilter }, categories);

  if (!a.hasActivity) return null;

  const projectionShort = a.projectedBalance < 0;

  const vitals: Vital[] = [
    {
      key: 'avg',
      label: 'Avg / day',
      value: formatARS(Math.round(a.avgDailySpend), { compact: true }),
      sub: `over ${a.elapsedDays.length} ${a.elapsedDays.length === 1 ? 'day' : 'days'}`,
      icon: Flame,
    },
    {
      key: 'peak',
      label: 'Biggest hit',
      value: a.biggestSpend ? formatARS(a.biggestSpend.amount, { compact: true }) : '—',
      sub: a.biggestSpend?.label ?? 'nothing logged',
      icon: Receipt,
    },
    {
      key: 'quiet',
      label: 'No-spend days',
      value: String(a.noSpendDays),
      sub: `of ${a.elapsedDays.length} so far`,
      icon: CalendarCheck,
      tone: a.noSpendDays > 0 ? 'good' : 'default',
    },
    {
      key: 'close',
      label: 'Projected close',
      value: formatARS(Math.round(a.projectedBalance), { compact: true }),
      sub:
        a.forecastConfidence === 'low'
          ? 'rough — few days yet'
          : projectionShort
            ? 'short at this rate'
            : 'if the rate holds',
      icon: projectionShort ? TrendingDown : TrendingUp,
      tone: projectionShort ? 'warn' : 'good',
    },
  ];

  return (
    <section className="px-5">
      <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] mb-2">
        Month vitals
      </h2>
      <dl className="grid grid-cols-2 border-t border-l border-[var(--color-ink)]/12">
        {vitals.map((v, i) => {
          const Icon = v.icon;
          return (
            <div
              key={v.key}
              className="reveal-item border-r border-b border-[var(--color-ink)]/12 px-3 py-3"
              style={{ '--i': i } as React.CSSProperties}
            >
              <dt className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
                <Icon size={11} strokeWidth={2} aria-hidden="true" />
                {v.label}
              </dt>
              <dd
                className={`font-display font-semibold text-lg tabular leading-none mt-1.5 ${
                  v.tone === 'warn'
                    ? 'text-[var(--color-terracotta-dp)]'
                    : v.tone === 'good'
                      ? 'text-[var(--color-ink)]'
                      : 'text-[var(--color-ink)]'
                }`}
              >
                {v.value}
              </dd>
              {v.sub && (
                <dd className="text-[9px] font-mono uppercase tracking-[0.1em] text-[var(--color-ink-3)] mt-1 truncate">
                  {v.sub}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </section>
  );
};
