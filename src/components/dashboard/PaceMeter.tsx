import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { useMonthAnalytics } from '../../lib/analytics';
import { formatARS } from '../../utils/currency';
import { EASE_OUT } from '../../lib/motion';

/**
 * Are we burning faster than the month is passing?
 *
 * Every figure elsewhere in the app is a total; none of them answer the one
 * question a shared household actually argues about. This is a ruler: the
 * track is the month's income, the fill is what has gone out, and the notch is
 * where the calendar has got to. Fill short of the notch means the month is
 * being won; fill past it means the current rate does not reach the 30th.
 *
 * Deliberately a straight track rather than a dial -- the rest of the system
 * is rules and baselines, and a gauge needle would be the only curve in the
 * product.
 */
export const PaceMeter: React.FC = () => {
  const { incomes, expenses, selectedMonth, userFilter, categories } = useFinance();
  const reduce = useReducedMotion();
  const a = useMonthAnalytics({ incomes, expenses, selectedMonth, userFilter }, categories);

  if (a.totalIncome <= 0) return null;

  /* Pace is a rate question, so it reads spend *to date* -- comparing a
     month's forward-booked rent against two elapsed days would report every
     month as wildly ahead of pace on the 2nd. */
  const spentPct = Math.min(100, (a.spendToDate / a.totalIncome) * 100);
  const timePct = a.shape.progress * 100;
  const overspill = a.spendToDate > a.totalIncome;

  /* Three states, and the copy says which. Colour alone would fail anyone who
     cannot separate mustard from terracotta. */
  const drift = a.spendToDate - a.pacedBudget;
  const onPace = Math.abs(drift) < a.totalIncome * 0.03;
  const ahead = drift > 0;

  const verdict = onPace ? 'On pace' : ahead ? 'Ahead of pace' : 'Under pace';
  const tone = onPace
    ? 'text-[var(--color-ink-2)]'
    : ahead
      ? 'text-[var(--color-terracotta-dp)]'
      : 'text-[var(--color-mustard-dp)]';

  return (
    <section className="px-5">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)]">
          Burn pace
        </h2>
        <p className={`text-[10px] font-mono uppercase tracking-[0.12em] font-bold ${tone}`}>
          {verdict}
          {!onPace && (
            <span className="font-normal opacity-70">
              {' · '}
              {formatARS(Math.abs(Math.round(drift)), { compact: true })}
            </span>
          )}
        </p>
      </div>

      <div className="relative h-7 bg-[var(--color-ink)]/10 overflow-hidden">
        {/* Week divisions. Early in the month the fill is a sliver and the
            track would otherwise read as one dead grey block; the rules give
            the empty part a scale to be empty against. */}
        {[7, 14, 21, 28].map((d) => (
          <span
            key={d}
            aria-hidden="true"
            style={{ left: `${(d / a.shape.daysInMonth) * 100}%` }}
            className="absolute inset-y-0 w-px bg-[var(--color-ink)]/12"
          />
        ))}

        {/* Spend fill. */}
        <motion.div
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: spentPct / 100 }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 }}
          style={{ transformOrigin: 'left' }}
          className={`absolute inset-y-0 left-0 w-full ${
            overspill ? 'bg-[var(--color-terracotta)]' : 'bg-[var(--color-ink)]'
          }`}
        />

        {/* Where the calendar has got to. The fill has to be read against
            this, so it sits above the fill and carries its own label. */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.75 }}
          style={{ left: `${timePct}%` }}
          className="absolute inset-y-0 w-px bg-[var(--color-mustard)]"
        >
          <span className="absolute -top-0.5 -left-[3px] w-[7px] h-[7px] bg-[var(--color-mustard)]" />
        </motion.div>

      </div>

      {/* The figure sits under the track, not inside it. A label printed over
          a bar that fills behind it has to be legible on both the filled and
          the empty half at once, and blend modes solve that by making it
          unreadable on both. */}
      <div className="flex items-center justify-between mt-1.5 text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
        <span className="text-[var(--color-ink-2)] font-bold">
          {spentPct > 0 && spentPct < 1 ? '<1' : Math.round(spentPct)}% of inflow spent
        </span>
        <span>Day {a.shape.today} of {a.shape.daysInMonth}</span>
      </div>

      <p className="mt-1 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
        <span className="w-[7px] h-[7px] bg-[var(--color-mustard)] shrink-0" aria-hidden="true" />
        Notch = even burn for today
      </p>
    </section>
  );
};
