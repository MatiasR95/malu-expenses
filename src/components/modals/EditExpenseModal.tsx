import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Expense, PaymentMethod, UserId } from '../../types/finance';
import { Sheet } from '../common/Sheet';
import { CategoryIcon } from '../common/CategoryIcon';
import { CardMark } from '../common/CardMark';
import { EASE_OUT, PRESS, PRESS_HARD } from '../../lib/motion';

interface EditExpenseModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

const FIELD =
  'w-full h-12 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] px-3 text-sm text-[var(--color-ink)] outline-none focus:block-shadow-sm transition-shadow';
const LABEL = 'text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] block mb-1.5';

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ expense, isOpen, onClose }) => {
  const { categories, updateExpense, deleteExpense } = useFinance();

  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [loggedBy, setLoggedBy] = useState<UserId>('mati');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debito');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!expense) return;
    setAmount(expense.amount);
    setCategoryId(expense.categoryId);
    setLoggedBy(expense.loggedBy);
    setPaymentMethod(expense.paymentMethod);
    setNote(expense.note || '');
    setDate(expense.date);
    setConfirmingDelete(false);
  }, [expense]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense || amount <= 0) return;
    updateExpense(expense.id, {
      amount, categoryId, loggedBy, paymentMethod,
      note: note.trim() || undefined, date,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!expense) return;
    /* Was `window.confirm`, which on iOS standalone blocks the whole app in a
       system alert that does not match anything else here. Two-step inline
       confirm instead -- same safety, no context switch. */
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    deleteExpense(expense.id);
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen && !!expense}
      onClose={onClose}
      title="Edit expense"
      subtitle={categories.find((c) => c.id === categoryId)?.name ?? 'Outflow'}
      tone="olive"
      footer={
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={PRESS}
            onClick={handleDelete}
            className={`h-14 flex items-center justify-center gap-2 font-mono font-bold text-[10px] uppercase tracking-[0.16em] transition-all ${
              confirmingDelete
                ? 'flex-1 bg-[var(--color-terracotta)] text-white'
                : 'w-14 bg-[var(--color-terracotta)] text-white'
            }`}
          >
            <Trash2 size={16} />
            {confirmingDelete && <span>Tap again to delete</span>}
          </motion.button>

          {!confirmingDelete && (
            <motion.button
              type="submit"
              form="edit-expense-form"
              whileTap={PRESS}
              className="flex-1 h-14 bg-[var(--color-ink)] text-white font-mono font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              <Check size={17} strokeWidth={3} /> Save
            </motion.button>
          )}
        </div>
      }
    >
      <form id="edit-expense-form" onSubmit={handleSave} className="px-4 py-4 flex flex-col gap-5">
        <div>
          <label htmlFor="exp-amount" className={LABEL}>Amount (ARS)</label>
          <input
            id="exp-amount"
            type="number"
            inputMode="numeric"
            required
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className={`${FIELD} !h-16 !text-2xl font-display font-semibold tabular`}
          />
        </div>

        <fieldset>
          <legend className={LABEL}>Category</legend>
          <div className="grid grid-cols-4 gap-1.5">
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  whileTap={PRESS_HARD}
                  aria-pressed={isSelected}
                  onClick={() => setCategoryId(cat.id)}
                  className={`relative min-h-[4.25rem] px-1 py-2 flex flex-col items-center justify-center gap-1.5 border-2 transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                      : 'bg-[var(--color-paper-hi)] text-[var(--color-ink-2)] border-[var(--color-ink)]/12'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="edit-cat-marker"
                      transition={{ duration: 0.22, ease: EASE_OUT }}
                      className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--color-mustard)]"
                    />
                  )}
                  <CategoryIcon name={cat.icon} size={18} color={isSelected ? cat.color : undefined} />
                  <span className="text-[8.5px] font-mono uppercase tracking-[0.06em] leading-[1.15] text-center line-clamp-2">
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className={LABEL}>Paid by</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['mati', 'belu'] as UserId[]).map((u) => (
              <motion.button
                key={u}
                type="button"
                whileTap={PRESS}
                aria-pressed={loggedBy === u}
                onClick={() => setLoggedBy(u)}
                className={`h-12 text-[11px] font-mono uppercase tracking-[0.12em] font-bold border-2 transition-colors ${
                  loggedBy === u
                    ? 'bg-[var(--color-ink)] text-[var(--color-mustard)] border-[var(--color-ink)]'
                    : 'bg-[var(--color-paper-hi)] text-[var(--color-ink-2)] border-[var(--color-ink)]/15'
                }`}
              >
                {u}
              </motion.button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="exp-note" className={LABEL}>Note</label>
          <input
            id="exp-note"
            type="text"
            placeholder="What was it?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${FIELD} placeholder-[var(--color-ink)]/35`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="exp-method" className={LABEL}>Method</label>
            <select
              id="exp-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className={FIELD}
            >
              <option value="debito">Debit</option>
              <option value="credito">Credit</option>
              <option value="transferencia">Transfer</option>
              <option value="efectivo">Cash</option>
            </select>
          </div>
          <div>
            <label htmlFor="exp-date" className={LABEL}>Date</label>
            <input
              id="exp-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={FIELD}
            />
          </div>
        </div>

        {/* Provenance. A row that arrived through the statement parser says so
            here -- otherwise, once it is dated into the middle of the month,
            there is no way to tell it from something typed by hand. */}
        {expense?.cardBatchId && (
          <p className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
            <CardMark batchId={expense.cardBatchId} size="md" />
            Posted from a statement batch
          </p>
        )}
      </form>
    </Sheet>
  );
};
