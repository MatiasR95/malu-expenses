import React from 'react';
import { CreditCard } from 'lucide-react';

/**
 * The credit mark.
 *
 * A card row is the one thing in this ledger that has not actually left the
 * account yet -- it is a debt with a due date, sitting in the same list as
 * money that is already gone. So it gets its own reading, and it gets it in
 * two places at once:
 *
 *   - the stripe (`CARD_STRIPE`), a magnetic-tape band down the leading edge
 *     of the row, so a card row is identifiable at a glance from the shape of
 *     the list rather than by reading any label;
 *   - the chip below, which names it, and names the statement it came off
 *     when the row was posted as part of a batch.
 *
 * Terracotta is already the app's outflow signal, so this reads as "outflow,
 * of a particular kind" rather than as a fourth colour nobody has met.
 */

/** Magnetic-stripe edge. Drop on any `relative` row that was paid by card. */
export const CardStripe: React.FC = () => (
  <span
    aria-hidden="true"
    className="absolute inset-y-0 left-0 w-[3px] bg-[var(--color-terracotta)]"
  >
    {/* Tape texture: the stripe is banded rather than solid, which is what
        stops it reading as a generic "selected row" accent bar. */}
    <span
      className="absolute inset-0 opacity-45"
      style={{
        backgroundImage:
          'repeating-linear-gradient(180deg, transparent 0 3px, rgba(0,0,0,0.55) 3px 5px)',
      }}
    />
  </span>
);

interface CardMarkProps {
  /** Statement this row was posted from, if it arrived through a batch. */
  batchId?: string;
  /** Compact chip for dense ledger rows. */
  size?: 'sm' | 'md';
  className?: string;
}

export const CardMark: React.FC<CardMarkProps> = ({ batchId, size = 'sm', className = '' }) => (
  <span
    className={`shrink-0 inline-flex items-center gap-1 bg-[var(--color-terracotta)] text-white font-mono font-bold uppercase tracking-[0.14em] ${
      size === 'sm' ? 'h-[15px] px-1 text-[8px]' : 'h-[18px] px-1.5 text-[9px]'
    } ${className}`}
    title={batchId ? 'Paid by card · posted from a statement batch' : 'Paid by card'}
  >
    <CreditCard size={size === 'sm' ? 9 : 11} strokeWidth={2.75} />
    Card
    {batchId && (
      <>
        <span className="opacity-50">·</span>
        {/* The batch's own tail, so two statements posted in the same month
            are told apart without opening either row. */}
        <span className="opacity-80">{batchId.slice(-4)}</span>
      </>
    )}
  </span>
);
