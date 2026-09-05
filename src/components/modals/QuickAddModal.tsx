import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Check, Users, Zap, Building2, PiggyBank, CreditCard } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod } from '../../types/finance';
import { Sheet } from '../common/Sheet';
import { CategoryIcon } from '../common/CategoryIcon';
import { Amount } from '../common/Amount';
import { EASE_OUT, PRESS, PRESS_HARD } from '../../lib/motion';
import { tick } from '../../utils/haptics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string;
  initialMode?: 'expense' | 'income';
}

type IncomeType = 'cuota' | 'suplemento' | 'assurant' | 'carryover';

const INCOME_TYPES: { id: IncomeType; label: string; icon: typeof Users; preset: number }[] = [
  { id: 'cuota', label: 'Dues', icon: Users, preset: 45000 },
  { id: 'suplemento', label: 'Store', icon: Zap, preset: 29000 },
  { id: 'assurant', label: 'Salary', icon: Building2, preset: 1200000 },
  { id: 'carryover', label: 'Carry-over', icon: PiggyBank, preset: 0 },
];

/** Two-up segmented choice. Used for payer and payment method. */
const Segmented = <T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) => (
  <fieldset>
    <legend className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] mb-2">
      {label}
    </legend>
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <motion.button
            key={opt.id}
            type="button"
            whileTap={PRESS}
            aria-pressed={isActive}
            onClick={() => onChange(opt.id)}
            className={`h-12 px-2 text-[11px] font-mono uppercase tracking-[0.1em] font-bold border-2 transition-colors duration-150 ${
              isActive
                ? 'bg-[var(--color-ink)] text-[var(--color-mustard)] border-[var(--color-ink)]'
                : 'bg-[var(--color-paper-hi)] text-[var(--color-ink-2)] border-[var(--color-ink)]/15 hover:border-[var(--color-ink)]/40'
            }`}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  </fieldset>
);

export const QuickAddModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialCategoryId,
  initialMode = 'expense',
}) => {
  const { categories, addExpense, addIncome, supplements } = useFinance();

  const [mode, setMode] = useState<'expense' | 'income'>(initialMode);
  const [amountStr, setAmountStr] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLogger, setSelectedLogger] = useState<'mati' | 'belu'>('mati');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [note, setNote] = useState('');
  const [incomeType, setIncomeType] = useState<IncomeType>('cuota');
  const [memberName, setMemberName] = useState('');
  const [selectedSupplement, setSelectedSupplement] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setAmountStr('0');
    setMemberName('');
    setNote('');
    setSelectedPaymentMethod('transferencia');
    if (initialMode === 'expense') {
      setSelectedCategory(initialCategoryId || categories[0]?.id || '');
    } else {
      setIncomeType('cuota');
    }
  }, [isOpen, initialMode, initialCategoryId, categories]);

  const currentAmount = parseInt(amountStr, 10) || 0;

  const canSubmit = useMemo(() => {
    if (currentAmount <= 0) return false;
    if (mode === 'expense') return !!selectedCategory;
    if (incomeType === 'cuota') return memberName.trim().length > 0;
    if (incomeType === 'suplemento') return supplements.length > 0;
    return true;
  }, [currentAmount, mode, selectedCategory, incomeType, memberName, supplements]);


  const handleKeyPress = (key: string) => {
    tick(6);
    setAmountStr((prev) => {
      if (prev === '0') return key === '000' ? '0' : key;
      if (prev.length > 8) return prev;
      return prev + key;
    });
  };

  const handleDeleteDigit = () => {
    tick(6);
    setAmountStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const date = new Date().toISOString().split('T')[0];

    if (mode === 'expense') {
      addExpense({
        amount: currentAmount,
        categoryId: selectedCategory,
        loggedBy: selectedLogger,
        paymentMethod: selectedPaymentMethod,
        note: note.trim() || undefined,
        date,
      });
    } else if (incomeType === 'cuota') {
      addIncome({
        amount: currentAmount, source: 'force_gym', platform: 'mercadopago',
        forceDetails: { type: 'cuota', memberName },
        notes: `Cuota Mensual - ${memberName}`, date, createdBy: 'mati',
      });
    } else if (incomeType === 'suplemento') {
      addIncome({
        amount: currentAmount, source: 'force_gym', platform: 'mercadopago',
        forceDetails: { type: 'suplemento', productTag: selectedSupplement },
        notes: `Store Sale - ${selectedSupplement}`, date, createdBy: 'mati',
      });
    } else if (incomeType === 'assurant') {
      addIncome({
        amount: currentAmount, source: 'assurant', platform: 'galicia',
        notes: 'Assurant Salary', date, createdBy: 'mati',
      });
    } else {
      /* Its own source, not `assurant`. Filing leftover cash as salary
         inflated the reported Assurant figure and flipped the Force screen's
         "salary already logged" check, which then hid the button for logging
         the real one. */
      addIncome({
        amount: currentAmount, source: 'carryover', platform: 'efectivo',
        notes: memberName.trim() || 'Carry-over from last month',
        date, createdBy: 'mati',
      });
    }

    tick(18);
    onClose();
  };

  const activeCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'expense' ? 'Log expense' : 'Log income'}
      subtitle={mode === 'expense' ? activeCategory?.name ?? 'Pick a category' : 'Money in'}
      tone={mode === 'expense' ? 'olive' : 'mustard'}
      footer={
        <motion.button
          type="submit"
          form="quick-add-form"
          whileTap={canSubmit ? PRESS : undefined}
          disabled={!canSubmit}
          className="w-full h-14 bg-[var(--color-ink)] text-white font-mono font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-35 transition-opacity"
        >
          <Check size={18} strokeWidth={3} />
          <span>{canSubmit ? 'Confirm' : mode === 'expense' ? 'Enter an amount' : 'Complete the details'}</span>
        </motion.button>
      }
    >
      <form id="quick-add-form" onSubmit={handleSubmit} className="px-4 pt-3 pb-4 flex flex-col gap-5">
        {/* Mode switch — the hub sets this, but flipping mid-entry should not
            cost a round trip back out to the hub. */}
        <div className="grid grid-cols-2 gap-2">
          {(['expense', 'income'] as const).map((m) => (
            <motion.button
              key={m}
              type="button"
              whileTap={PRESS}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`h-10 text-[10px] font-mono uppercase tracking-[0.2em] font-bold transition-colors duration-150 ${
                mode === m
                  ? 'bg-[var(--color-ink)] text-[var(--color-mustard)]'
                  : 'bg-[var(--color-ink)]/8 text-[var(--color-ink-3)] hover:bg-[var(--color-ink)]/14'
              }`}
            >
              {m}
            </motion.button>
          ))}
        </div>

        {/* Amount readout */}
        <div className="w-full bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] block-shadow flex flex-col items-center justify-center py-5 px-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] mb-1.5">
            Amount
          </span>
          <Amount value={currentAmount} size="hero" className="!text-[2.25rem] sm:!text-5xl" />
        </div>

        {mode === 'expense' ? (
          <>
            {/* Categories.
                Was a single horizontal scroll strip of 9px pills -- twelve
                categories, only three visible, no scroll affordance, and the
                far end of the list was effectively unreachable on a phone.
                Now every category is on screen at once in a 4-up grid. */}
            <fieldset>
              <legend className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] mb-2">
                Category
              </legend>
              <div className="grid grid-cols-4 gap-1.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <motion.button
                      key={cat.id}
                      type="button"
                      whileTap={PRESS_HARD}
                      aria-pressed={isSelected}
                      onClick={() => { setSelectedCategory(cat.id); tick(6); }}
                      className={`relative min-h-[4.25rem] px-1 py-2 flex flex-col items-center justify-center gap-1.5 border-2 transition-colors duration-150 ${
                        isSelected
                          ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                          : 'bg-[var(--color-paper-hi)] text-[var(--color-ink-2)] border-[var(--color-ink)]/12 hover:border-[var(--color-ink)]/40'
                      }`}
                    >
                      {isSelected && (
                        <motion.span
                          layoutId="cat-marker"
                          transition={{ duration: 0.22, ease: EASE_OUT }}
                          className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--color-mustard)]"
                        />
                      )}
                      <CategoryIcon
                        name={cat.icon}
                        size={19}
                        strokeWidth={isSelected ? 2 : 1.6}
                        color={isSelected ? cat.color : undefined}
                      />
                      <span className="text-[8.5px] font-mono uppercase tracking-[0.06em] leading-[1.15] text-center line-clamp-2">
                        {cat.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </fieldset>

            <Segmented
              label="Paid by"
              value={selectedLogger}
              onChange={setSelectedLogger}
              options={[{ id: 'mati', label: 'Mati' }, { id: 'belu', label: 'Belu' }]}
            />

            {/* Four methods, not two. `credito` existed in the model and in
                the edit sheet, but the one screen that logs most rows could
                only say transfer or cash -- so anything put on the card had to
                be logged wrong and corrected afterwards. */}
            <Segmented
              label="Method"
              value={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
              options={[
                { id: 'transferencia', label: 'Transfer' },
                { id: 'credito', label: 'Card' },
                { id: 'debito', label: 'Debit' },
                { id: 'efectivo', label: 'Cash' },
              ]}
            />

            {selectedPaymentMethod === 'credito' && (
              <p className="-mt-2.5 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-terracotta-dp)]">
                <CreditCard size={11} strokeWidth={2.5} />
                Marked on the card · counts toward the statement
              </p>
            )}

            {/* Note. Optional, and last, so it never stands between the
                keypad and a confirmed row -- but present, because half of
                what makes an entry legible a week later is one line of
                context the category cannot carry. */}
            <div>
              <label
                htmlFor="quick-note"
                className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] block mb-2"
              >
                Note <span className="opacity-50">· optional</span>
              </label>
              <input
                id="quick-note"
                type="text"
                autoComplete="off"
                placeholder="What was it?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-12 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] px-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none focus:block-shadow-sm transition-shadow"
              />
            </div>
          </>
        ) : (
          <fieldset>
            <legend className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] mb-2">
              Source
            </legend>
            <div className="grid grid-cols-4 gap-1.5">
              {INCOME_TYPES.map(({ id, label, icon: Icon, preset }) => {
                const isActive = incomeType === id;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    whileTap={PRESS_HARD}
                    aria-pressed={isActive}
                    onClick={() => {
                      setIncomeType(id);
                      if (id === 'suplemento' && supplements.length > 0) {
                        setSelectedSupplement(supplements[0].name);
                        setAmountStr(String(supplements[0].defaultPrice));
                      } else {
                        setAmountStr(String(preset));
                      }
                      if (id === 'carryover') setMemberName('');
                      tick(6);
                    }}
                    className={`min-h-[4.25rem] px-1 py-2 flex flex-col items-center justify-center gap-1.5 border-2 transition-colors duration-150 ${
                      isActive
                        ? 'bg-[var(--color-ink)] text-[var(--color-mustard)] border-[var(--color-ink)]'
                        : 'bg-[var(--color-paper-hi)] text-[var(--color-ink-2)] border-[var(--color-ink)]/12'
                    }`}
                  >
                    <Icon size={19} strokeWidth={isActive ? 2 : 1.6} />
                    <span className="text-[8.5px] font-mono uppercase tracking-[0.08em]">{label}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={incomeType}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                className="mt-3"
              >
                {(incomeType === 'cuota' || incomeType === 'carryover') && (
                  <input
                    type="text"
                    aria-label={incomeType === 'cuota' ? 'Member name' : 'Description'}
                    autoComplete="off"
                    placeholder={
                      incomeType === 'cuota' ? 'Member name' : 'Carry-over from August'
                    }
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full h-12 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] px-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none focus:block-shadow-sm transition-shadow"
                  />
                )}
                {incomeType === 'suplemento' && (
                  supplements.length === 0 ? (
                    <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)] text-center py-2">
                      No products set up yet — add one from the store screen
                    </p>
                  ) : (
                    <select
                      aria-label="Product"
                      value={selectedSupplement}
                      onChange={(e) => {
                        setSelectedSupplement(e.target.value);
                        const sup = supplements.find((s) => s.name === e.target.value);
                        if (sup) setAmountStr(String(sup.defaultPrice));
                      }}
                      className="w-full h-12 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] px-3 text-sm text-[var(--color-ink)] outline-none"
                    >
                      {supplements.map((sup) => (
                        <option key={sup.id} value={sup.name}>{sup.name}</option>
                      ))}
                    </select>
                  )
                )}
                {incomeType === 'assurant' && (
                  <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)] text-center py-2">
                    Adjust this month's figure on the keypad
                  </p>
                )}
                {incomeType === 'carryover' && (
                  <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)] leading-relaxed mt-2">
                    Cash you already had, not money earned this month. It counts
                    toward what's available to spend but stays out of Force and
                    salary totals.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </fieldset>
        )}

        {/* Boosters */}
        <div className="grid grid-cols-4 gap-1.5">
          {[5000, 10000, 20000, 50000].map((val) => (
            <motion.button
              key={val}
              type="button"
              whileTap={PRESS_HARD}
              onClick={() => { setAmountStr((p) => String((parseInt(p, 10) || 0) + val)); tick(6); }}
              className="h-11 border border-[var(--color-ink)]/25 text-[10px] font-mono uppercase font-bold text-[var(--color-ink-2)] hover:bg-[var(--color-ink)]/6 active:bg-[var(--color-ink)]/12 transition-colors"
            >
              +{(val / 1000)}k
            </motion.button>
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-1.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key)}
              className="h-14 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] text-lg font-mono font-bold text-[var(--color-ink)] block-shadow-sm active:bg-[var(--color-ink)] active:text-white active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-[background-color,box-shadow,transform] duration-75"
            >
              {key}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDeleteDigit}
            aria-label="Delete last digit"
            className="h-14 bg-[var(--color-terracotta)] border-2 border-[var(--color-ink)] text-white flex items-center justify-center block-shadow-sm active:bg-[var(--color-ink)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-[background-color,box-shadow,transform] duration-75"
          >
            <Delete size={18} />
          </button>
        </div>
      </form>
    </Sheet>
  );
};
