import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { UserFilter } from '../../types/finance';
import { SPRING_SNAP, PRESS } from '../../lib/motion';
import { getCurrentMonthKey } from '../../utils/currency';

function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const FILTERS: { id: UserFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mati', label: 'Mati' },
  { id: 'belu', label: 'Belu' },
];

/**
 * Masthead.
 *
 * The old header spent both corners on icon buttons that duplicated the nav
 * rail (bank sync) and hid the statement parser behind an unlabelled grid
 * glyph. Both moved to where they belong -- Sync is a tab, the parser is a
 * tile in the action hub -- which frees the row for the thing that was
 * missing entirely: the payer filter. Every figure downstream already reads
 * `userFilter`; until now nothing could set it.
 */
export const Header: React.FC = () => {
  const { userFilter, setUserFilter, monthlySummary, selectedMonth, setSelectedMonth, allMonths } =
    useFinance();
  const reduce = useReducedMotion();

  /* The app opens on the current month, so on the 1st every screen looked
     empty and there was no way back to last month short of the history chart.
     The month under the wordmark is now a stepper over every month on record;
     tapping the name itself jumps back to today. */
  const current = getCurrentMonthKey();
  const earliest = allMonths[allMonths.length - 1] ?? current;
  const latest = allMonths[0] ?? current;
  const canBack = selectedMonth > earliest;
  const canForward = selectedMonth < latest;
  const isCurrent = selectedMonth === current;
  const stepClass =
    'w-9 h-9 -my-2 flex items-center justify-center text-[var(--color-ink-3)] hover:text-[var(--color-ink)] disabled:opacity-25 disabled:pointer-events-none';

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-sage)]/92 backdrop-blur-md pt-safe">
      <div className="max-w-md mx-auto px-5 pt-3 pb-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[var(--color-mustard)] shrink-0" aria-hidden="true" />
            <span className="font-display font-semibold text-lg tracking-[0.14em] leading-none">
              MALU
            </span>
          </div>
          <div className="flex items-center -ml-2.5 mt-1.5">
            <motion.button
              type="button"
              whileTap={PRESS}
              onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
              disabled={!canBack}
              aria-label="Previous month"
              className={stepClass}
            >
              <ChevronLeft size={14} strokeWidth={2.25} />
            </motion.button>
            <button
              type="button"
              onClick={() => setSelectedMonth(current)}
              disabled={isCurrent}
              aria-label={isCurrent ? monthlySummary.monthName : `${monthlySummary.monthName}, jump to this month`}
              className={`text-[10px] font-mono uppercase tracking-[0.12em] truncate min-w-[8.5rem] text-center ${
                isCurrent ? 'text-[var(--color-ink-3)]' : 'text-[var(--color-ink)] font-bold underline underline-offset-4 decoration-[var(--color-mustard)]'
              }`}
            >
              {monthlySummary.monthName}
            </button>
            <motion.button
              type="button"
              whileTap={PRESS}
              onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
              disabled={!canForward}
              aria-label="Next month"
              className={stepClass}
            >
              <ChevronRight size={14} strokeWidth={2.25} />
            </motion.button>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Filter by payer"
          className="relative flex items-center gap-0.5 p-0.5 bg-[var(--color-ink)]/8 shrink-0"
        >
          {FILTERS.map((f) => {
            const isActive = userFilter === f.id;
            return (
              <motion.button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                whileTap={PRESS}
                onClick={() => setUserFilter(f.id)}
                className={`relative px-2.5 h-9 min-w-[2.6rem] flex items-center justify-center text-[10px] font-mono uppercase tracking-[0.08em] font-bold transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId={reduce ? undefined : 'filter-pill'}
                    transition={SPRING_SNAP}
                    className="absolute inset-0 bg-[var(--color-ink)]"
                  />
                )}
                <span className="relative">{f.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
