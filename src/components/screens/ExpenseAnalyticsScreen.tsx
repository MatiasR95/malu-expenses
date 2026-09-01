import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowRight, Plus, SlidersHorizontal } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { Amount } from '../common/Amount';
import { PRESS } from '../../lib/motion';

interface Props {
  onOpenQuickAdd: (categoryId?: string) => void;
  onOpenCreditCardSplitter: () => void;
  onOpenCategories: () => void;
}

export const ExpenseAnalyticsScreen: React.FC<Props> = ({
  onOpenQuickAdd,
  onOpenCreditCardSplitter,
  onOpenCategories,
}) => {
  const { monthlySummary, categories, userFilter } = useFinance();
  const { totalExpenses, byCategory, byLogger } = monthlySummary;

  /* The old build printed the raw category id here -- rows read
     "supermercado" / "gym_operacion" instead of the names the user gave them
     in settings. Resolve against the category list, and keep the id only as a
     last-resort fallback for rows whose category was since deleted. */
  const ranked = useMemo(
    () =>
      Object.entries(byCategory)
        .map(([id, amount]) => {
          const cat = categories.find((c) => c.id === id);
          return {
            id,
            name: cat?.name ?? id,
            icon: cat?.icon ?? id,
            color: cat?.color,
            budget: cat?.monthlyBudget,
            amount,
            share: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
          };
        })
        .sort((a, b) => b.amount - a.amount),
    [byCategory, categories, totalExpenses]
  );

  const topShare = ranked[0]?.share ?? 1;
  const splitTotal = byLogger.mati + byLogger.belu;
  const matiShare = splitTotal > 0 ? (byLogger.mati / splitTotal) * 100 : 50;

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Headline */}
      <section className="reveal px-5 pt-1 pb-5">
        <h1 className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--color-ink-3)] mb-2">
          {userFilter === 'all' ? 'Spent this month' : `Spent · ${userFilter}`}
        </h1>
        <Amount value={totalExpenses} size="hero" animate />

        {/* Who paid. `byLogger` was computed on every render and shown nowhere. */}
        {userFilter === 'all' && splitTotal > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--color-ink-3)] mb-1.5">
              <span>Mati ${Math.round(byLogger.mati).toLocaleString('en-US')}</span>
              <span>Belu ${Math.round(byLogger.belu).toLocaleString('en-US')}</span>
            </div>
            <div className="w-full h-2 flex bg-[var(--color-ink)]/10 overflow-hidden">
              <div
                style={{ width: `${matiShare}%` }}
                className="h-full bg-[var(--color-ink)] transition-[width] duration-700 ease-out"
              />
              <div className="h-full flex-1 bg-[var(--color-terracotta)]" />
            </div>
          </div>
        )}
      </section>

      {/* Statement parser */}
      <div className="reveal px-5 pb-5" style={{ animationDelay: '80ms' }}>
        <motion.button
          type="button"
          onClick={onOpenCreditCardSplitter}
          whileTap={PRESS}
          className="w-full bg-[var(--color-terracotta)] text-white p-4 flex items-center justify-between gap-3 hover:brightness-110 transition-[filter]"
        >
          <span className="flex items-center gap-3 min-w-0">
            <CreditCard size={20} strokeWidth={1.75} className="shrink-0" />
            <span className="flex flex-col text-left min-w-0">
              <span className="font-display font-medium text-lg tracking-wide leading-tight">
                Split a card batch
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.16em] opacity-75 mt-0.5">
                Paste statement text
              </span>
            </span>
          </span>
          <ArrowRight size={18} className="shrink-0" />
        </motion.button>
      </div>

      {/* Ranked categories */}
      <section className="w-full bg-[var(--color-olive-2)] text-white flex-1">
        <div className="px-5 py-2.5 flex items-center justify-between gap-3 rule-light">
          <h2 className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/70">
            By category
          </h2>
          {/* Editing categories lives here rather than in the action hub: the
              hub is for logging a transaction, and this is the one screen
              where you are already looking at the category list. */}
          <motion.button
            type="button"
            whileTap={PRESS}
            onClick={onOpenCategories}
            className="h-9 px-2 -mr-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--color-mustard)]"
          >
            <SlidersHorizontal size={12} />
            Manage
          </motion.button>
        </div>

        {ranked.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-display font-medium text-xl">No spending yet</p>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-white/45 mt-1.5">
              Categories fill in as you log
            </p>
          </div>
        ) : (
          <ul>
            {ranked.map((row, i) => {
              const overBudget = row.budget != null && row.amount > row.budget;
              return (
                <li
                  key={row.id}
                  className="reveal-item"
                  style={{ '--i': Math.min(i, 10) } as React.CSSProperties}
                >
                  <motion.button
                    type="button"
                    whileTap={PRESS}
                    onClick={() => onOpenQuickAdd(row.id)}
                    aria-label={`Log an expense in ${row.name}`}
                    className="group relative w-full px-5 py-4 flex items-center justify-between gap-4 text-left rule-light hover:bg-white/[0.05] transition-colors overflow-hidden"
                  >
                    {/* Share bar, scaled against the largest category so the
                        differences stay legible rather than all reading full. */}
                    <span
                      aria-hidden="true"
                      style={{
                        transform: `scaleX(${row.share / topShare})`,
                        transformOrigin: 'left',
                        backgroundColor: row.color ?? '#ffffff',
                      }}
                      className="absolute inset-y-0 left-0 w-full opacity-[0.14] pointer-events-none"
                    />

                    <span className="relative flex items-center gap-3.5 min-w-0">
                      <span className="w-9 h-9 shrink-0 border border-white/20 flex items-center justify-center">
                        <CategoryIcon name={row.icon} size={16} color={row.color} />
                      </span>
                      <span className="min-w-0 flex flex-col">
                        <span className="font-display font-medium text-base tracking-wide truncate">
                          {row.name}
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-white/50 mt-0.5 flex items-center gap-1.5">
                          {Math.round(row.share)}% of total
                          {overBudget && (
                            <span className="text-[var(--color-terracotta)] font-bold">· over</span>
                          )}
                        </span>
                      </span>
                    </span>

                    <span className="relative shrink-0 flex items-center gap-2">
                      <Amount value={row.amount} size="md" className="text-[var(--color-mustard)]" />
                      <Plus
                        size={13}
                        strokeWidth={2.5}
                        className="text-white/0 group-hover:text-white/50 transition-colors"
                      />
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
