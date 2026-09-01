import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { Expense, UserId, PaymentMethod } from '../../types/finance';
import { X, Trash2, Check, Tag } from 'lucide-react';

interface EditExpenseModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  expense,
  isOpen,
  onClose,
}) => {
  const { categories, updateExpense, deleteExpense } = useFinance();

  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>('');
  const [loggedBy, setLoggedBy] = useState<UserId>('mati');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debito');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount);
      setCategoryId(expense.categoryId);
      setLoggedBy(expense.loggedBy);
      setPaymentMethod(expense.paymentMethod);
      setNote(expense.note || '');
      setDate(expense.date);
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    updateExpense(expense.id, {
      amount,
      categoryId,
      loggedBy,
      paymentMethod,
      note: note.trim() || undefined,
      date,
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Delete this expense record?')) {
      deleteExpense(expense.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[var(--color-bg-sage)]/90 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[var(--color-bg-sage)] border-2 border-[var(--color-ink)] p-5 shadow-[4px_4px_0_0_var(--color-ink)] z-10 max-h-[92vh] flex flex-col overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4 border-b-2 border-[var(--color-ink)] pb-3">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-[var(--color-ink)] flex items-center gap-2">
              <Tag size={16} />
              <span>Modify Outflow</span>
            </h2>

            <button
              onClick={onClose}
              className="text-[var(--color-ink)] hover:scale-110 transition-transform"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-[var(--color-ink)] block mb-1">
                Amount ($ ARS)
              </label>
              <input
                type="number"
                required
                value={amount || ''}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border-2 border-[var(--color-ink)] px-4 py-3 text-xl font-display font-bold text-[var(--color-ink)] focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-ink)]"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-[var(--color-ink)] block mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto p-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`py-2 px-1 border-2 flex flex-col items-center gap-1 transition-all ${
                      categoryId === cat.id
                        ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-white'
                        : 'border-[var(--color-ink)]/20 bg-white text-[var(--color-ink)] hover:border-[var(--color-ink)]'
                    }`}
                  >
                    <span className="text-[9px] font-mono uppercase tracking-widest font-bold truncate w-full text-center">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logger Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLoggedBy('mati')}
                className={`py-2 px-3 text-[10px] font-mono uppercase font-bold border-2 transition-all ${
                  loggedBy === 'mati'
                    ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-[2px_2px_0_0_var(--color-accent-mustard)]'
                    : 'bg-white text-[var(--color-ink)] border-[var(--color-ink)]/20'
                }`}
              >
                Paid by Mati
              </button>

              <button
                type="button"
                onClick={() => setLoggedBy('belu')}
                className={`py-2 px-3 text-[10px] font-mono uppercase font-bold border-2 transition-all ${
                  loggedBy === 'belu'
                    ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-[2px_2px_0_0_var(--color-accent-terracotta)]'
                    : 'bg-white text-[var(--color-ink)] border-[var(--color-ink)]/20'
                }`}
              >
                Paid by Belu
              </button>
            </div>

            {/* Note, Method & Date */}
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Note..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="bg-white border-2 border-[var(--color-ink)] px-2 py-2 text-xs font-mono text-[var(--color-ink)] placeholder-[var(--color-ink)]/40 focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-ink)]"
              />

              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="bg-white border-2 border-[var(--color-ink)] px-2 py-2 text-[10px] font-mono uppercase font-bold text-[var(--color-ink)] focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-ink)]"
              >
                <option value="debito">Debit</option>
                <option value="credito">Credit</option>
                <option value="transferencia">Transfer</option>
                <option value="efectivo">Cash</option>
              </select>

              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-white border-2 border-[var(--color-ink)] px-2 py-2 text-[10px] font-mono uppercase font-bold text-[var(--color-ink)] focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-ink)]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="py-3 px-4 bg-[var(--color-accent-terracotta)] hover:brightness-110 border-2 border-[var(--color-ink)] text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
              >
                <Trash2 size={15} />
              </button>

              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-[var(--color-ink)] text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
              >
                <Check size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
