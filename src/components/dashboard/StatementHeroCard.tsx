import React from 'react';
import { CalendarDays, Gauge, Timer } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useMonthAnalytics } from '../../lib/analytics';
import { BalanceTrace } from './BalanceTrace';
import { Amount } from '../common/Amount';
import { formatARS } from '../../utils/currency';

/**
 * The statement head: what's left, what it burns down to, and the trace.
 *
 * The headline used to read the unfiltered monthly summary while its own label
 * claimed to be filtered -- switching the masthead to "Belu" relabelled the
 * figure without changing it, so the number was simply wrong for two of the
 * three filter states. Everything here now comes from the same filtered month
 * walk the charts use, so the label and the figure always agree.
 */
export const StatementHeroCard: React.FC = () => {
  const { incomes, expenses, selectedMonth, userFilter, categories } = useFinance();
  const a = useMonthAnalytics({ incomes, expenses, selectedMonth, userFilter }, categories);

  const daysLeft = Math.max(0, a.shape.daysInMonth - a.shape.today);
  /* The household view reads the account, not the month: what September left
     behind is still money October can spend. A payer filter stays a reading
     of this month alone, so it keeps the month's net. */
  const headline = userFilter === 'all' ? a.balance : a.net;
  const safePerDay = headline > 0 && daysLeft > 0 ? Math.round(headline / daysLeft) : 0;

  const monthFlow = a.balance - a.carriedIn;
  const [py, pm] = selectedMonth.split('-').map(Number);
  const prevLabel = new Date(py, pm - 2, 1).toLocaleDateString('en-US', { month: 'short' });

  /* Runway is the honest version of "days left": how long the money lasts at
     the rate it is actually going out, which can be shorter *or* longer than
     the calendar month. Capped for display -- "412 days" is noise. */
  const runway = Number.isFinite(a.runwayDays) ? Math.max(0, Math.floor(a.runwayDays)) : null;
  const runwayShort = runway !== null && runway < daysLeft;

  const label =
    userFilter === 'all' ? 'Available' : `Net after ${userFilter === 'mati' ? 'Mati' : 'Belu'}`;

  return (
    <section className="reveal w-full pt-1 flex flex-col gap-5">
      <div className="px-5">
        <h1 className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--color-ink-3)] mb-2">
          {label}
        </h1>

        <Amount
          value={headline}
          size="hero"
          animate
          className={headline < 0 ? 'text-[var(--color-terracotta-dp)]' : 'text-[var(--color-ink)]'}
        />

        {/* Where the headline comes from: what came in from last month, and what
            this month has added or taken away on top of it. */}
        {userFilter === 'all' && a.chained && (
          <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.12em] tabular text-[var(--color-ink-3)]">
            {a.carriedIn !== 0 && (
              <>
                From {prevLabel} {formatARS(a.carriedIn, { compact: true })}
                {' · '}
              </>
            )}
            This month{' '}
            <span className={monthFlow < 0 ? 'text-[var(--color-terracotta-dp)]' : 'text-[var(--color-ink)]'}>
              {monthFlow >= 0 ? '+' : '−'}
              {formatARS(Math.abs(monthFlow), { compact: true })}
            </span>
          </p>
        )}

        {/* Runway strip. Three readings on one baseline, receipt-style. */}
        <dl
          style={{ animationDelay: '120ms' }}
          className="reveal mt-4 grid grid-cols-3 border-y border-[var(--color-ink)]/12 divide-x divide-[var(--color-ink)]/12"
        >
          <div className="py-2.5 pr-3">
            <dt className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
              <Gauge size={10} strokeWidth={2.25} aria-hidden="true" />
              Safe / day
            </dt>
            <dd className="font-display font-semibold text-base tabular mt-1">
              ${safePerDay.toLocaleString('en-US')}
            </dd>
          </div>

          <div className="py-2.5 px-3">
            <dt className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
              <CalendarDays size={10} strokeWidth={2.25} aria-hidden="true" />
              Days left
            </dt>
            <dd className="font-display font-semibold text-base tabular mt-1">{daysLeft}</dd>
          </div>

          <div className="py-2.5 pl-3">
            <dt className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
              <Timer size={10} strokeWidth={2.25} aria-hidden="true" />
              Runway
            </dt>
            <dd
              className={`font-display font-semibold text-base tabular mt-1 ${
                runwayShort ? 'text-[var(--color-terracotta-dp)]' : ''
              }`}
            >
              {runway === null ? '∞' : runway > 99 ? '99+' : runway}
              <span className="text-[9px] font-mono font-normal text-[var(--color-ink-3)] ml-1">
                {runway === null ? 'no burn' : 'days'}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <BalanceTrace />
    </section>
  );
};
