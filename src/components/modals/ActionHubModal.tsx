import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'quick_expense' | 'quick_income') => void;
}

export const ActionHubModal: React.FC<Props> = ({ isOpen, onClose, onSelectAction }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[var(--color-bg-sage)]/80 backdrop-blur-sm"
        />

        {/* Modal Content - Brutalist 50/50 Split */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full h-[60vh] flex flex-col bg-[var(--color-ink)]"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex-1 flex flex-col">
            {/* Income Half */}
            <button
              onClick={() => { onSelectAction('quick_income'); onClose(); }}
              className="flex-1 w-full bg-[var(--color-accent-mustard)] text-[var(--color-ink)] flex flex-col items-center justify-center group hover:brightness-105 active:brightness-95 transition-all"
            >
              <ArrowDownLeft size={48} strokeWidth={1} className="mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-display text-4xl tracking-tight">Income</span>
              <span className="text-[11px] font-mono uppercase tracking-widest mt-2 opacity-60">Assurant / Force</span>
            </button>

            {/* Expense Half */}
            <button
              onClick={() => { onSelectAction('quick_expense'); onClose(); }}
              className="flex-1 w-full bg-[var(--color-block-2)] text-white flex flex-col items-center justify-center group hover:bg-[var(--color-block-3)] active:bg-[var(--color-block-1)] transition-all"
            >
              <ArrowUpRight size={48} strokeWidth={1} className="mb-4 group-hover:scale-110 transition-transform opacity-80" />
              <span className="font-display text-4xl tracking-tight">Expense</span>
              <span className="text-[11px] font-mono uppercase tracking-widest mt-2 opacity-60">Log spending</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
