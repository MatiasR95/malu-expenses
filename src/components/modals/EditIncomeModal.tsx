import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Income, PaymentPlatform } from '../../types/finance';
import { Sheet } from '../common/Sheet';
import { PRESS } from '../../lib/motion';

interface EditIncomeModalProps {
  income: Income | null;
  isOpen: boolean;
  onClose: () => void;
}

const FIELD =
  'w-full h-12 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] px-3 text-sm text-[var(--color-ink)] outline-none focus:block-shadow-sm transition-shadow';
const LABEL = 'text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] block mb-1.5';

const PLATFORMS: { id: PaymentPlatform; label: string }[] = [
  { id: 'mercadopago', label: 'Mercado Pago' },
  { id: 'cuenta_dni', label: 'Cuenta DNI' },
  { id: 'galicia', label: 'Galicia' },
  { id: 'lemon', label: 'Lemon' },
  { id: 'efectivo', label: 'Cash' },
  { id: 'otro', label: 'Other' },
];

export const EditIncomeModal: React.FC<EditIncomeModalProps> = ({ income, isOpen, onClose }) => {
  const { updateIncome, deleteIncome } = useFinance();

  const [amount, setAmount] = useState(0);
  const [platform, setPlatform] = useState<PaymentPlatform>('mercadopago');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [memberName, setMemberName] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isMembership = income?.forceDetails?.type === 'cuota';

  useEffect(() => {
    if (!income) return;
    setAmount(income.amount);
    setPlatform(income.platform);
    setNotes(income.notes || '');
    setDate(income.date);
    setMemberName(income.forceDetails?.memberName || '');
    setConfirmingDelete(false);
  }, [income]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!income || amount <= 0) return;
    updateIncome(income.id, {
      amount,
      platform,
      notes: notes.trim() || undefined,
      date,
      forceDetails: income.forceDetails
        ? { ...income.forceDetails, memberName: memberName.trim() || undefined }
        : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!income) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    deleteIncome(income.id);
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen && !!income}
      onClose={onClose}
      title="Edit income"
      subtitle={isMembership ? 'Membership dues' : 'Inflow'}
      tone="mustard"
      footer={
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={PRESS}
            onClick={handleDelete}
            className={`h-14 flex items-center justify-center gap-2 font-mono font-bold text-[10px] uppercase tracking-[0.16em] bg-[var(--color-terracotta)] text-white transition-all ${
              confirmingDelete ? 'flex-1' : 'w-14'
            }`}
          >
            <Trash2 size={16} />
            {confirmingDelete && <span>Tap again to delete</span>}
          </motion.button>

          {!confirmingDelete && (
            <motion.button
              type="submit"
              form="edit-income-form"
              whileTap={PRESS}
              className="flex-1 h-14 bg-[var(--color-ink)] text-white font-mono font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              <Check size={17} strokeWidth={3} /> Save
            </motion.button>
          )}
        </div>
      }
    >
      <form id="edit-income-form" onSubmit={handleSave} className="px-4 py-4 flex flex-col gap-5">
        <div>
          <label htmlFor="inc-amount" className={LABEL}>Amount (ARS)</label>
          <input
            id="inc-amount"
            type="number"
            inputMode="numeric"
            required
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className={`${FIELD} !h-16 !text-2xl font-display font-semibold tabular`}
          />
        </div>

        {isMembership && (
          <div>
            <label htmlFor="inc-member" className={LABEL}>Member</label>
            <input
              id="inc-member"
              type="text"
              placeholder="Member name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className={`${FIELD} placeholder-[var(--color-ink)]/35`}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="inc-platform" className={LABEL}>Platform</label>
            <select
              id="inc-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as PaymentPlatform)}
              className={FIELD}
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="inc-date" className={LABEL}>Date</label>
            <input
              id="inc-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={FIELD}
            />
          </div>
        </div>

        <div>
          <label htmlFor="inc-notes" className={LABEL}>Note</label>
          <input
            id="inc-notes"
            type="text"
            placeholder="What was this?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${FIELD} placeholder-[var(--color-ink)]/35`}
          />
        </div>
      </form>
    </Sheet>
  );
};
