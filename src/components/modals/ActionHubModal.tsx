import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Dumbbell, CreditCard } from 'lucide-react';
import { Sheet } from '../common/Sheet';
import { PRESS } from '../../lib/motion';

export type HubAction = 'quick_expense' | 'quick_income' | 'gym_dues' | 'cc_splitter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: HubAction) => void;
}

const TILES: {
  action: HubAction;
  label: string;
  hint: string;
  icon: typeof ArrowUpRight;
  className: string;
}[] = [
  {
    action: 'quick_expense',
    label: 'Expense',
    hint: 'Log spending',
    icon: ArrowUpRight,
    className: 'bg-[var(--color-olive-2)] text-white',
  },
  {
    action: 'quick_income',
    label: 'Income',
    hint: 'Money in',
    icon: ArrowDownLeft,
    className: 'bg-[var(--color-mustard)] text-[var(--color-ink)]',
  },
  {
    action: 'gym_dues',
    label: 'Gym dues',
    hint: 'Force check-in',
    icon: Dumbbell,
    className: 'bg-[var(--color-olive-4)] text-white',
  },
  {
    action: 'cc_splitter',
    label: 'Card batch',
    hint: 'Paste statement',
    icon: CreditCard,
    className: 'bg-[var(--color-terracotta)] text-white',
  },
];

/**
 * The Power Hub. Four tiles, every one of them labelled.
 *
 * The previous version offered only two of the four actions the app already
 * knew how to handle -- the gym check-in and the statement parser were
 * unreachable from here, and the statement parser's only other entry point was
 * an unlabelled grid glyph in the header.
 */
export const ActionHubModal: React.FC<Props> = ({ isOpen, onClose, onSelectAction }) => {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Log" subtitle="Pick what you're recording" tone="ink">
      <div className="grid grid-cols-2 gap-2 p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        {TILES.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <motion.button
              key={tile.action}
              type="button"
              style={{ '--i': i } as React.CSSProperties}
              whileTap={PRESS}
              onClick={() => {
                onSelectAction(tile.action);
                onClose();
              }}
              className={`reveal-item aspect-[4/3] flex flex-col items-start justify-between p-4 text-left transition-[filter] hover:brightness-110 ${tile.className}`}
            >
              <Icon size={28} strokeWidth={1.5} />
              <span>
                <span className="font-display font-medium text-2xl tracking-tight block leading-none">
                  {tile.label}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] opacity-65 mt-1.5 block">
                  {tile.hint}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </Sheet>
  );
};
