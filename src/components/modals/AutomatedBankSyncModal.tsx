import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AutomatedBankSyncModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSync = () => {
    setSyncState('syncing');
    // Mock sync process
    setTimeout(() => {
      setSyncState('success');
      setTimeout(() => {
        onClose();
        setSyncState('idle');
      }, 1500);
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[var(--color-bg-sage)]/90 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-sm bg-white border-2 border-[var(--color-ink)] p-6 shadow-[8px_8px_0_0_var(--color-ink)] z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--color-ink)] hover:scale-110 transition-transform"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center pt-2 pb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-mustard)] border-2 border-[var(--color-ink)] flex items-center justify-center mb-4">
              {syncState === 'idle' && <RefreshCw size={24} className="text-[var(--color-ink)]" />}
              {syncState === 'syncing' && (
                <RefreshCw size={24} className="text-[var(--color-ink)] animate-spin" />
              )}
              {syncState === 'success' && <CheckCircle2 size={24} className="text-[var(--color-ink)]" />}
              {syncState === 'error' && <AlertCircle size={24} className="text-[var(--color-ink)]" />}
            </div>

            <h2 className="font-display font-medium text-2xl tracking-wide text-[var(--color-ink)] mb-2">
              Bank Sync
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-ink)]/60 mb-6 px-4">
              Pull latest transactions from Galicia and MercadoPago APIs.
            </p>

            <button
              onClick={handleSync}
              disabled={syncState !== 'idle'}
              className="w-full py-4 bg-[var(--color-ink)] text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 border-2 border-transparent hover:border-[var(--color-accent-mustard)]"
            >
              {syncState === 'idle' && 'Start Sync'}
              {syncState === 'syncing' && 'Syncing...'}
              {syncState === 'success' && 'Synced!'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
