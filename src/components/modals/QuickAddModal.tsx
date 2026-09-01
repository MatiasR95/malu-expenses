import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { Delete, Check, Users, Zap, Building2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string;
  initialMode?: 'expense' | 'income';
}

export const QuickAddModal: React.FC<Props> = ({ isOpen, onClose, initialCategoryId, initialMode = 'expense' }) => {
  const { categories, addExpense, addIncome } = useFinance();
  
  const [mode, setMode] = useState<'expense' | 'income'>(initialMode);
  const [amountStr, setAmountStr] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLogger, setSelectedLogger] = useState<'mati' | 'belu'>('mati');
  const [incomeType, setIncomeType] = useState<'cuota' | 'suplemento' | 'assurant' | 'otro'>('cuota');
  const [memberName, setMemberName] = useState('');
  const [selectedSupplement, setSelectedSupplement] = useState('Creatine Monohydrate');

  const supplements = [
    { id: 's1', name: 'Creatine Monohydrate', defaultPrice: 28000 },
    { id: 's2', name: 'Whey Protein', defaultPrice: 35000 },
    { id: 's3', name: 'Pre-Workout', defaultPrice: 22000 },
  ];

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAmountStr('0');
      setMemberName('');
      if (initialMode === 'expense') {
        setSelectedCategory(initialCategoryId || categories[0]?.id || '');
      } else {
        setIncomeType('cuota');
      }
    }
  }, [isOpen, initialMode, initialCategoryId, categories]);

  const currentAmount = parseInt(amountStr, 10);

  const handleKeyPress = (key: string) => {
    setAmountStr(prev => {
      if (prev === '0' && key !== '000') return key;
      if (prev === '0' && key === '000') return '0';
      if (prev.length > 8) return prev;
      return prev + key;
    });
  };

  const handleDeleteDigit = () => {
    setAmountStr(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleAddQuickAmount = (val: number) => {
    setAmountStr(prev => String(parseInt(prev, 10) + val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) return;

    if (mode === 'expense') {
      addExpense({
        amount: currentAmount,
        categoryId: selectedCategory,
        loggedBy: selectedLogger,
        paymentMethod: 'transferencia',
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      if (incomeType === 'cuota') {
        if (!memberName) return;
        addIncome({
          amount: currentAmount,
          source: 'force_gym',
          platform: 'mercadopago',
          forceDetails: { type: 'cuota', memberName },
          notes: `Cuota Mensual - ${memberName}`,
          date: new Date().toISOString().split('T')[0],
          createdBy: 'mati'
        });
      } else if (incomeType === 'suplemento') {
        addIncome({
          amount: currentAmount,
          source: 'force_gym',
          platform: 'mercadopago',
          forceDetails: { type: 'suplemento', productTag: selectedSupplement },
          notes: `Store Sale - ${selectedSupplement}`,
          date: new Date().toISOString().split('T')[0],
          createdBy: 'mati'
        });
      } else if (incomeType === 'assurant') {
        addIncome({
          amount: currentAmount,
          source: 'assurant',
          platform: 'galicia',
          notes: `Assurant Salary`,
          date: new Date().toISOString().split('T')[0],
          createdBy: 'mati'
        });
      } else if (incomeType === 'otro') {
        addIncome({
          amount: currentAmount,
          source: 'assurant', // Reusing a general source, but note acts as description
          platform: 'efectivo',
          notes: memberName || `Manual Cash Addition`,
          date: new Date().toISOString().split('T')[0],
          createdBy: 'mati'
        });
      }
    }

    if ('vibrate' in navigator) navigator.vibrate(15);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex flex-col justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[var(--color-bg-sage)]/90 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md mx-auto bg-[var(--color-bg-sage)] text-[var(--color-ink)] flex flex-col max-h-[90vh] shadow-2xl"
        >
          {/* Brutalist Header Block */}
          <div className={`w-full flex items-center justify-between p-4 ${mode === 'expense' ? 'bg-[var(--color-block-1)] text-white' : 'bg-[var(--color-accent-mustard)] text-[var(--color-ink)]'}`}>
            <span className="font-display font-medium text-xl uppercase tracking-widest">
              Log {mode}
            </span>
            <button onClick={onClose} className="opacity-60 hover:opacity-100">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
            
            {/* Amount Display Block */}
            <div className="w-full bg-white border-2 border-[var(--color-ink)] flex flex-col items-center justify-center py-6 px-4 mb-2 shadow-[4px_4px_0_0_var(--color-ink)]">
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1 font-bold">
                Transaction Amount
              </div>
              <div className="font-display font-bold text-4xl sm:text-5xl flex items-baseline tracking-normal whitespace-nowrap overflow-hidden">
                <span className="opacity-40 mr-1 text-2xl sm:text-3xl">$</span>
                <span>{Number(amountStr).toLocaleString('en-US')}</span>
                {/* ml-1 added to ensure stroke doesn't overlap text */}
                <span className="decimal-outline text-2xl sm:text-3xl ml-1">.0</span>
              </div>
            </div>

            {/* EXPENSE VIEW */}
            {mode === 'expense' ? (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none items-stretch">
                  {categories.map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-3 min-h-[40px] border-2 shrink-0 flex items-center justify-center gap-1.5 text-[9px] font-mono uppercase tracking-widest font-bold transition-all ${
                          isSelected
                            ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-[2px_2px_0_0_var(--color-accent-terracotta)]'
                            : 'bg-white text-[var(--color-ink)] border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]'
                        }`}
                      >
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedLogger('mati')}
                    className={`py-3 px-1 sm:px-2 text-[9px] sm:text-[10px] whitespace-nowrap font-mono uppercase font-bold border-2 transition-all ${
                      selectedLogger === 'mati'
                        ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-[2px_2px_0_0_var(--color-accent-mustard)]'
                        : 'bg-white text-[var(--color-ink)] border-[var(--color-ink)]/20'
                    }`}
                  >
                    Paid by Mati
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLogger('belu')}
                    className={`py-3 px-1 sm:px-2 text-[9px] sm:text-[10px] whitespace-nowrap font-mono uppercase font-bold border-2 transition-all ${
                      selectedLogger === 'belu'
                        ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-[2px_2px_0_0_var(--color-accent-terracotta)]'
                        : 'bg-white text-[var(--color-ink)] border-[var(--color-ink)]/20'
                    }`}
                  >
                    Paid by Belu
                  </button>
                </div>
              </>
            ) : (
              /* INCOME VIEW */
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => { setIncomeType('cuota'); setAmountStr('45000'); }}
                    className={`py-3 px-1 text-[8px] sm:text-[9px] font-mono uppercase font-bold border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      incomeType === 'cuota'
                        ? 'bg-[var(--color-ink)] text-[var(--color-accent-mustard)] border-[var(--color-ink)]'
                        : 'bg-white text-[var(--color-ink)] border-[var(--color-ink)]/20'
                    }`}
                  >
                    <Users size={14} /> <span>Dues</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIncomeType('suplemento'); setAmountStr('29000'); }}
                    className={`py-3 px-1 text-[8px] sm:text-[9px] font-mono uppercase font-bold border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      incomeType === 'suplemento'
                        ? 'bg-[var(--color-ink)] text-[var(--color-accent-mustard)] border-[var(--color-ink)]'
                        : 'bg-white text-[var(--color-ink)] border-[var(--color-ink)]/20'
                    }`}
                  >
                    <Zap size={14} /> <span>Store</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIncomeType('assurant'); setAmountStr('1200000'); }}
                    className={`py-3 px-1 text-[8px] sm:text-[9px] font-mono uppercase font-bold border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      incomeType === 'assurant'
                        ? 'bg-[var(--color-ink)] text-[var(--color-accent-mustard)] border-[var(--color-ink)]'
                        : 'bg-white text-[var(--color-ink)] border-[var(--color-ink)]/20'
                    }`}
                  >
                    <Building2 size={14} /> <span>Salary</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIncomeType('otro'); setAmountStr('0'); setMemberName(''); }}
                    className={`py-3 px-1 text-[8px] sm:text-[9px] font-mono uppercase font-bold border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      incomeType === 'otro'
                        ? 'bg-[var(--color-ink)] text-[var(--color-accent-mustard)] border-[var(--color-ink)]'
                        : 'bg-white text-[var(--color-ink)] border-[var(--color-ink)]/20'
                    }`}
                  >
                    <span className="font-bold text-lg mb-[-4px]">+</span> <span>Other</span>
                  </button>
                </div>

                {(incomeType === 'cuota' || incomeType === 'otro') && (
                  <input
                    type="text"
                    placeholder={incomeType === 'cuota' ? "Member full name..." : "Description (e.g. Carry-over Cash)"}
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    className="w-full bg-white border-2 border-[var(--color-ink)] px-3 py-3 text-sm font-mono uppercase tracking-widest text-[var(--color-ink)] placeholder-[var(--color-ink)]/30 outline-none focus:shadow-[2px_2px_0_0_var(--color-ink)]"
                  />
                )}
                {incomeType === 'suplemento' && (
                  <select
                    value={selectedSupplement}
                    onChange={e => {
                      setSelectedSupplement(e.target.value);
                      const sup = supplements.find(s => s.name === e.target.value);
                      if (sup) setAmountStr(String(sup.defaultPrice));
                    }}
                    className="w-full bg-white border-2 border-[var(--color-ink)] px-3 py-3 text-sm font-mono uppercase tracking-widest text-[var(--color-ink)] outline-none focus:shadow-[2px_2px_0_0_var(--color-ink)] appearance-none"
                  >
                    {supplements.map(sup => (
                      <option key={sup.id} value={sup.name}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                )}
                {incomeType === 'assurant' && (
                  <div className="w-full text-center text-[9px] font-mono uppercase opacity-50">
                    Use keypad to edit actual month's salary amount
                  </div>
                )}
              </div>
            )}

            {/* Quick Booster Chips */}
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 py-1">
              {[5000, 10000, 20000, 50000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddQuickAmount(val)}
                  className="py-2.5 border border-[var(--color-ink)]/20 hover:bg-[var(--color-ink)]/5 active:bg-[var(--color-ink)]/10 text-[9px] sm:text-[10px] font-mono uppercase font-bold text-[var(--color-ink)] transition-colors whitespace-nowrap"
                >
                  +{Number(val).toLocaleString('en-US')}
                </button>
              ))}
            </div>

            {/* Tactile Numeric Keypad */}
            <div className="grid grid-cols-3 gap-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0'].map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className="py-3 sm:py-4 bg-white border-2 border-[var(--color-ink)] active:bg-[var(--color-ink)] active:text-white text-lg font-mono font-bold text-[var(--color-ink)] transition-colors duration-0 shadow-[2px_2px_0_0_var(--color-ink)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
                >
                  {key}
                </button>
              ))}

              <button
                type="button"
                onClick={handleDeleteDigit}
                className="py-3 sm:py-4 bg-[var(--color-accent-terracotta)] border-2 border-[var(--color-ink)] active:bg-[var(--color-ink)] text-white flex items-center justify-center transition-colors duration-0 shadow-[2px_2px_0_0_var(--color-ink)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
              >
                <Delete size={18} />
              </button>
            </div>

            {/* Confirm Button */}
            <button
              type="submit"
              disabled={currentAmount <= 0}
              className="w-full mt-1 sm:mt-2 py-4 sm:py-5 bg-[var(--color-ink)] text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:scale-100"
            >
              <Check size={18} strokeWidth={3} />
              <span>Confirm Transaction</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
