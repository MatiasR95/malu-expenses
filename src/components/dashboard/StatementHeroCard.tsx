import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { InteractiveHeroChart } from './InteractiveHeroChart';
import { Amount } from '../common/Amount';

/**
 * The statement head: what's left, what it burns down to, and the trace.
 *
 * `dailySafeBurnRate` and `daysRemaining` were already computed in context and
 * displayed nowhere -- which is the single most useful thing a shared-cash app
 * can tell you, so they now sit directly under the headline figure.
 */
export const StatementHeroCard: React.FC = () => {
  const { monthlySummary, userFilter } = useFinance();
  const { netAvailableCash, dailySafeBurnRate, daysRemaining, totalIncome, totalExpenses } =
    monthlySummary;

  const label = userFilter === 'all' ? 'Available' : `Available · ${userFilter}`;
  const isPositive = netAvailableCash >= 0;

  return (
    <section className="reveal w-full pt-1 pb-6">
      <div className="px-5">
        <h1 className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--color-ink-3)] mb-2">
          {label}
        </h1>

        <Amount value={netAvailableCash} size="hero" animate className="text-[var(--color-ink)]" />

        {/* Runway strip. Three readings on one baseline, receipt-style. */}
        <dl
          style={{ animationDelay: '120ms' }}
          className="reveal mt-4 grid grid-cols-3 border-y border-[var(--color-ink)]/12 divide-x divide-[var(--color-ink)]/12"
        >
          <div className="py-2.5 pr-3">
            <dt className="text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
              Safe / day
            </dt>
            <dd className="font-display font-semibold text-base tabular mt-1">
              ${dailySafeBurnRate.toLocaleString('en-US')}
            </dd>
          </div>
          <div className="py-2.5 px-3">
            <dt className="text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
              Days left
            </dt>
            <dd className="font-display font-semibold text-base tabular mt-1">{daysRemaining}</dd>
          </div>
          <div className="py-2.5 pl-3">
            <dt className="text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
              Month flow
            </dt>
            <dd className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <TrendingUp size={14} className="text-[var(--color-mustard-dp)]" strokeWidth={2.25} />
              ) : (
                <TrendingDown size={14} className="text-[var(--color-terracotta-dp)]" strokeWidth={2.25} />
              )}
              <span className="font-display font-semibold text-base tabular">
                {totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%
              </span>
              <span className="text-[9px] font-mono text-[var(--color-ink-3)]">spent</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-5">
        <InteractiveHeroChart />
      </div>
    </section>
  );
};
