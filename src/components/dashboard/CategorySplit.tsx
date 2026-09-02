import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { rollUpCategories } from '../../lib/analytics';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatARS } from '../../utils/currency';
import { EASE_OUT, PRESS } from '../../lib/motion';

interface Props {
  onSeeAll: () => void;
}

/**
 * Where the month went, in one band.
 *
 * A pie would need a legend, five labels and a lot of vertical space to say
 * what a single proportional band says at a glance. Segments are ordered
 * largest first and carry their own share label once they are wide enough to
 * hold one, so the picture is readable without the legend -- the rows below it
 * are for the exact figures, not for decoding the colours.
 */
export const CategorySplit: React.FC<Props> = ({ onSeeAll }) => {
  const { expenses, categories, selectedMonth, userFilter } = useFinance();
  const reduce = useReducedMotion();

  const rows = rollUpCategories(expenses, categories, selectedMonth, userFilter);
  if (rows.length === 0) return null;

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const top = rows.slice(0, 4);
  const restAmount = rows.slice(4).reduce((s, r) => s + r.amount, 0);

  const segments = [
    ...top,
    ...(restAmount > 0
      ? [
          {
            id: '__rest',
            name: `${rows.length - 4} more`,
            icon: 'Tag',
            color: '#8a8f7e',
            amount: restAmount,
            share: (restAmount / total) * 100,
            budget: undefined,
            budgetUsed: undefined,
            overBudget: false,
            count: 0,
          },
        ]
      : []),
  ];

  return (
    <section className="px-5">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)]">
          Where it went
        </h2>
        <motion.button
          type="button"
          whileTap={PRESS}
          onClick={onSeeAll}
          className="h-9 -mr-1 px-1 flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
        >
          All {rows.length}
          <ArrowRight size={11} strokeWidth={2.25} />
        </motion.button>
      </div>

      {/* Proportional band. */}
      <div
        className="flex w-full h-9 gap-px bg-[var(--color-ink)]/12 overflow-hidden"
        role="img"
        aria-label={segments
          .map((s) => `${s.name} ${Math.round(s.share)} percent`)
          .join(', ')}
      >
        {segments.map((s, i) => (
          <motion.div
            key={s.id}
            initial={reduce ? false : { opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.1 + i * 0.06 }}
            style={{
              width: `${s.share}%`,
              backgroundColor: s.color,
              transformOrigin: 'left',
            }}
            className="relative h-full min-w-[2px] flex items-center justify-center"
          >
            {s.share >= 14 && (
              <span className="text-[9px] font-mono font-bold tabular text-[var(--color-ink)]/70">
                {Math.round(s.share)}%
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend rows, with a budget bar wherever the category has one set. */}
      <ul className="mt-2.5 flex flex-col">
        {top.map((r, i) => (
          <li
            key={r.id}
            className="reveal-item flex items-center gap-2.5 py-1.5"
            style={{ '--i': i } as React.CSSProperties}
          >
            <span
              aria-hidden="true"
              className="w-2.5 h-2.5 shrink-0"
              style={{ backgroundColor: r.color }}
            />
            <CategoryIcon
              name={r.icon}
              size={13}
              strokeWidth={1.75}
              className="shrink-0 text-[var(--color-ink-2)]"
            />
            <span className="min-w-0 flex-1 text-[11px] font-body font-medium truncate">
              {r.name}
            </span>

            {r.budgetUsed != null && (
              <span
                className="w-12 h-1.5 bg-[var(--color-ink)]/12 shrink-0"
                aria-hidden="true"
              >
                <span
                  className={`block h-full ${
                    r.overBudget
                      ? 'bg-[var(--color-terracotta-dp)]'
                      : 'bg-[var(--color-ink)]/55'
                  }`}
                  style={{ width: `${Math.min(100, r.budgetUsed * 100)}%` }}
                />
              </span>
            )}

            <span className="shrink-0 font-display font-semibold text-[13px] tabular">
              {formatARS(r.amount, { compact: true })}
            </span>
            {r.overBudget && (
              <span className="shrink-0 text-[8px] font-mono uppercase tracking-[0.1em] font-bold text-[var(--color-terracotta-dp)]">
                over
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
