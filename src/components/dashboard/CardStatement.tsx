import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Layers } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Amount } from '../common/Amount';
import { formatDayMonth, newestFirst } from '../../utils/currency';
import { PRESS } from '../../lib/motion';

interface Props {
  onOpenSplitter: () => void;
}

/**
 * What is riding on the card this month.
 *
 * Card spending is the one outflow in this ledger that has not left the
 * account yet -- it is a bill being assembled in the background, and until now
 * the app had no idea what it added up to. Rows posted from a statement batch
 * scattered themselves through the month by date and became indistinguishable
 * from cash.
 *
 * So this is the card itself: the running statement total, how many rows are
 * on it, how many batches it was assembled from, and the action that adds the
 * next one -- in the object the money is actually on.
 */
export const CardStatement: React.FC<Props> = ({ onOpenSplitter }) => {
  const { expenses, selectedMonth, userFilter, monthlySummary } = useFinance();

  const card = useMemo(() => {
    const rows = expenses
      .filter(
        (e) =>
          e.paymentMethod === 'credito' &&
          e.date.startsWith(selectedMonth) &&
          (userFilter === 'all' || e.loggedBy === userFilter)
      )
      .sort(newestFirst);

    const total = rows.reduce((sum, e) => sum + e.amount, 0);
    const batches = new Set(rows.map((e) => e.cardBatchId).filter(Boolean));

    return { rows, total, batchCount: batches.size, latest: rows[0] };
  }, [expenses, selectedMonth, userFilter]);

  /* Share of the month's spend that is deferred rather than paid. The single
     most useful thing this figure can tell you, and it costs one line. */
  const share =
    monthlySummary.totalExpenses > 0
      ? Math.round((card.total / monthlySummary.totalExpenses) * 100)
      : 0;

  return (
    <div className="w-full bg-[var(--color-terracotta)] text-white relative overflow-hidden">
      {/* Magnetic stripe across the head, the way it sits on the real thing. */}
      <span
        aria-hidden="true"
        className="block h-3.5 w-full bg-[var(--color-ink)]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.10) 6px 7px)',
        }}
      />

      <div className="px-4 pt-4 pb-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/65">
              On the card
            </p>
            <div className="mt-1.5">
              <Amount value={card.total} size="lg" />
            </div>
          </div>

          {/* EMV chip. Purely a signifier -- it is what makes the block read as
              a card at a glance rather than as another coloured panel. */}
          <span
            aria-hidden="true"
            className="shrink-0 w-9 h-7 bg-[var(--color-mustard)] border border-[var(--color-ink)]/40 grid grid-cols-2 grid-rows-3 gap-px p-px"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="bg-[var(--color-ink)]/25" />
            ))}
          </span>
        </div>

        <p className="mt-2 text-[9px] font-mono uppercase tracking-[0.16em] text-white/70 tabular">
          {card.rows.length === 0 ? (
            'Nothing charged this month'
          ) : (
            <>
              {card.rows.length} {card.rows.length === 1 ? 'row' : 'rows'}
              {card.batchCount > 0 && (
                <>
                  {' · '}
                  {card.batchCount} {card.batchCount === 1 ? 'batch' : 'batches'}
                </>
              )}
              {share > 0 && <> · {share}% of spend</>}
              {card.latest && <> · last {formatDayMonth(card.latest.date)}</>}
            </>
          )}
        </p>
      </div>

      <motion.button
        type="button"
        onClick={onOpenSplitter}
        whileTap={PRESS}
        className="w-full h-14 px-4 bg-[var(--color-ink)] text-white flex items-center justify-between gap-3 hover:bg-[var(--color-olive-1)] transition-colors"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <Layers size={16} strokeWidth={2} className="text-[var(--color-mustard)] shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold truncate">
            Split a statement batch
          </span>
        </span>
        <ArrowRight size={16} className="shrink-0 text-[var(--color-mustard)]" />
      </motion.button>
    </div>
  );
};
