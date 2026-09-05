import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Plus, ChevronDown } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Expense } from '../../types/finance';
import { CategoryIcon } from '../common/CategoryIcon';
import { Amount } from '../common/Amount';
import { CardMark, CardStripe } from '../common/CardMark';
import { formatDayMonth, newestFirst } from '../../utils/currency';
import { PRESS } from '../../lib/motion';

interface Props {
  onExpenseClick: (expense: Expense) => void;
  onAdd: () => void;
}

const PAGE = 8;

/** Olive stack, darkest first. Alternating tones read as a printed ledger. */
const ROW_TONES = [
  'bg-[var(--color-olive-2)] text-white',
  'bg-[var(--color-olive-3)] text-white',
  'bg-[var(--color-olive-4)] text-white',
  'bg-[var(--color-olive-5)] text-[var(--color-ink)]',
];

export const RecentActivityLedger: React.FC<Props> = ({ onExpenseClick, onAdd }) => {
  const { expenses, categories, userFilter } = useFinance();
  const [visible, setVisible] = useState(PAGE);

  const filtered = expenses
    .filter((e) => userFilter === 'all' || e.loggedBy === userFilter)
    .sort(newestFirst);

  const rows = filtered.slice(0, visible);

  if (filtered.length === 0) {
    return (
      <section className="w-full bg-[var(--color-olive-2)] text-white px-6 py-12 flex flex-col items-center text-center gap-4">
        <span className="w-12 h-12 border-2 border-white/25 flex items-center justify-center">
          <ArrowUpRight size={22} strokeWidth={1.5} className="text-white/60" />
        </span>
        <div>
          <h3 className="font-display font-medium text-xl">Nothing logged yet</h3>
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-white/50 mt-1.5">
            {userFilter === 'all' ? 'This month is still blank' : `Nothing under ${userFilter}`}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={onAdd}
          whileTap={PRESS}
          className="mt-1 h-11 px-5 bg-[var(--color-mustard)] text-[var(--color-ink)] text-[10px] font-mono uppercase tracking-[0.2em] font-bold flex items-center gap-2"
        >
          <Plus size={14} strokeWidth={3} />
          Log the first one
        </motion.button>
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col">
      <div className="px-5 py-3 flex items-center justify-between">
        <h2 className="text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--color-ink-3)]">
          Recent activity
        </h2>
        <span className="text-[10px] font-mono tabular text-[var(--color-ink-3)]">
          {filtered.length}
        </span>
      </div>

      <ul className="w-full flex flex-col">
        {rows.map((expense, i) => {
          const category = categories.find((c) => c.id === expense.categoryId);
          const onCard = expense.paymentMethod === 'credito';
          return (
            <li
              key={expense.id}
              className="reveal-item"
              style={{ '--i': i % PAGE } as React.CSSProperties}
            >
                <motion.button
                  type="button"
                  whileTap={PRESS}
                  onClick={() => onExpenseClick(expense)}
                  className={`relative w-full py-4 pr-5 flex items-center justify-between gap-4 text-left rule-light hover:brightness-[1.08] transition-[filter] ${
                    onCard ? 'pl-[calc(1.25rem+3px)]' : 'pl-5'
                  } ${ROW_TONES[i % ROW_TONES.length]}`}
                >
                  {onCard && <CardStripe />}

                  <span className="flex items-center gap-3.5 min-w-0">
                    <span className="w-9 h-9 shrink-0 border border-current/30 flex items-center justify-center opacity-80">
                      <CategoryIcon name={category?.icon ?? 'Tag'} size={16} strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex flex-col">
                      <span className="font-display font-medium text-[15px] tracking-wide leading-snug truncate">
                        {expense.note || category?.name || 'Expense'}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-[0.14em] mt-1 flex items-center gap-1.5">
                        {onCard && <CardMark batchId={expense.cardBatchId} />}
                        <span className="truncate opacity-55">
                          {category?.name ?? 'Uncategorised'}
                        </span>
                        <span className="opacity-30 shrink-0">/</span>
                        <span className="shrink-0 opacity-55">{expense.loggedBy}</span>
                      </span>
                    </span>
                  </span>

                  {/* Date lives under the figure rather than in the metadata
                      run -- on a 375px row the left column has to carry the
                      title, and a third segment there pushed every label into
                      an ellipsis. */}
                  <span className="shrink-0 flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1.5">
                      <ArrowUpRight size={12} strokeWidth={2.5} className="opacity-40" />
                      <Amount value={expense.amount} size="md" />
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-[0.14em] opacity-45">
                      {formatDayMonth(expense.date)}
                    </span>
                  </span>
                </motion.button>
            </li>
          );
        })}
      </ul>

      {visible < filtered.length && (
        <motion.button
          type="button"
          whileTap={PRESS}
          onClick={() => setVisible((v) => v + PAGE)}
          className="w-full h-14 bg-[var(--color-paper)] text-[var(--color-ink-2)] text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-[var(--color-ink)]/6 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronDown size={13} />
          Show {Math.min(PAGE, filtered.length - visible)} more
        </motion.button>
      )}
    </section>
  );
};
