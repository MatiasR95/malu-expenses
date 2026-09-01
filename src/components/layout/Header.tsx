import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { UserFilter } from '../../types/finance';
import { SPRING_SNAP, PRESS } from '../../lib/motion';

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
  const { userFilter, setUserFilter, monthlySummary } = useFinance();
  const reduce = useReducedMotion();

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
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-3)] mt-1.5 truncate">
            {monthlySummary.monthName}
          </p>
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
