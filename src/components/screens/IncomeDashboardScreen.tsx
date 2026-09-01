import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Plus, Check, ShoppingBag, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { StepLineChart } from '../dashboard/StepLineChart';

interface Props {
  onOpenQuickAdd: (mode: 'expense' | 'income') => void;
}

const FORCE_REGULAR_MEMBERS = [
  { id: 'f1', name: 'Facu', defaultAmount: 45000, plan: 'Black' },
  { id: 'f2', name: 'Nico', defaultAmount: 45000, plan: 'Black' },
  { id: 'f3', name: 'Juli', defaultAmount: 45000, plan: 'Black' },
  { id: 'f4', name: 'Vito', defaultAmount: 45000, plan: 'Black' },
  { id: 'f5', name: 'Emma', defaultAmount: 45000, plan: 'Black' },
  { id: 'f6', name: 'Tomy', defaultAmount: 45000, plan: 'Black' },
];

export const IncomeDashboardScreen: React.FC<Props> = ({ onOpenQuickAdd }) => {
  const { monthlySummary, addIncome, incomes } = useFinance();
  const [, setJustLoggedMember] = useState<string | null>(null);

  const forceTargetRevenue = 1500000;
  const forceProgressPercent = Math.min(100, Math.round((monthlySummary.forceGymTotal / forceTargetRevenue) * 100));

  const today = new Date();
  const currentMonthIncomes = incomes.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  
  const forceGymIncomes = currentMonthIncomes.filter(e => e.source === 'force_gym');
  const paidMemberNames = new Set(
    forceGymIncomes
      .filter(e => e.forceDetails?.type === 'cuota' && e.forceDetails.memberName)
      .map(e => e.forceDetails!.memberName!)
  );

  const supplements = [
    { id: 's1', name: 'Creatine Monohydrate', defaultPrice: 28000 },
    { id: 's2', name: 'Whey Protein', defaultPrice: 35000 },
    { id: 's3', name: 'Pre-Workout', defaultPrice: 22000 },
  ];

  const handle1TapCheckIn = (memberName: string, amount: number) => {
    addIncome({
      amount: amount,
      source: 'force_gym',
      platform: 'mercadopago',
      forceDetails: { type: 'cuota', memberName: memberName },
      notes: `Cuota Mensual - ${memberName}`,
      date: today.toISOString().split('T')[0],
      createdBy: 'mati',
    });
    setJustLoggedMember(memberName);
    setTimeout(() => setJustLoggedMember(null), 2000);
  };

  const handleLogSupplement = (productName: string, price: number) => {
    addIncome({
      amount: price,
      source: 'force_gym',
      platform: 'mercadopago',
      forceDetails: { type: 'suplemento', productTag: productName },
      notes: `Store Sale - ${productName}`,
      date: today.toISOString().split('T')[0],
      createdBy: 'mati',
    });
  };

  const formatARS = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const hasSalaryLogged = currentMonthIncomes.some(i => i.source === 'assurant');

  return (
    <div className="w-full flex flex-col min-h-[100vh] bg-[var(--color-block-1)] pb-12">
      {/* 1. Force Gym Revenue Hero - Mustard Yellow */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full px-6 pt-6 pb-8 bg-[var(--color-accent-mustard)] text-[var(--color-ink)] rounded-b-2xl shadow-xl shadow-black/20 relative z-20"
      >
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest opacity-80 mb-6 border-b border-[var(--color-ink)]/10 pb-2">
          <span>Force Gym HQ</span>
          <span>{monthlySummary.monthName}</span>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-1">
            Total Force Revenue
          </div>
          <div className="font-display font-medium text-4xl sm:text-5xl md:text-6xl text-[var(--color-ink)] flex items-baseline whitespace-nowrap tracking-normal">
            <span className="text-2xl sm:text-3xl mr-1 opacity-70">$</span>
            <span>{Math.floor(monthlySummary.forceGymTotal).toLocaleString()}</span>
            <span className="decimal-outline text-3xl sm:text-4xl ml-1">.0</span>
          </div>
        </div>

        {/* New Brutalist Chart */}
        <div className="mt-8 mb-4">
          <StepLineChart />
        </div>

        {/* Progress Bar vs Target */}
        <div className="mt-6 pt-4 border-t border-[var(--color-ink)]/10">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest opacity-80 mb-2">
            <span>Target: {formatARS(forceTargetRevenue)}</span>
            <span className="font-bold">{forceProgressPercent}% complete</span>
          </div>
          <div className="w-full bg-[var(--color-ink)]/10 h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${forceProgressPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-[var(--color-ink)]"
            />
          </div>
        </div>
      </motion.div>

      {/* 1.5 Assurant Salary Block */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white text-[var(--color-ink)] px-6 py-6 border-b border-black/10 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--color-ink)]/5 flex items-center justify-center shrink-0">
            <Building2 size={20} strokeWidth={1.5} className="text-[var(--color-ink)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-medium text-xl tracking-wide">Assurant</span>
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-60 truncate max-w-[90px]">Corp Salary</span>
          </div>
        </div>
        
        {hasSalaryLogged ? (
          <div className="flex flex-col items-end">
             <span className="font-display font-semibold text-lg">{formatARS(monthlySummary.assurantTotal)}</span>
             <span className="text-[9px] font-mono uppercase tracking-widest opacity-50 flex items-center gap-1"><Check size={10} /> Logged</span>
          </div>
        ) : (
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="px-4 py-2 bg-[var(--color-ink)] text-[var(--color-accent-mustard)] text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-black transition-colors shrink-0"
          >
            <Plus size={14} /> Log
          </button>
        )}
      </motion.div>

      {/* 2. 1-Tap Regular Member Check-In Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="w-full bg-[var(--color-block-2)] text-white px-6 py-6 border-b border-black/10"
      >
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest opacity-80 mb-4 pb-2 border-b border-white/10">
          <span>Member Check-In</span>
          <span className="text-[var(--color-accent-mustard)] text-[10px]">Tap to log $45k</span>
        </div>

        <div className="flex flex-col space-y-1">
          {FORCE_REGULAR_MEMBERS.map((member, i) => {
            const isPaid = paidMemberNames.has(member.name);
            return (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                key={member.id}
                type="button"
                onClick={() => !isPaid && handle1TapCheckIn(member.name, member.defaultAmount)}
                disabled={isPaid}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  isPaid
                    ? 'bg-[var(--color-block-3)] opacity-60'
                    : 'bg-[var(--color-block-3)] hover:bg-[var(--color-block-4)] hover:text-[var(--color-ink)]'
                }`}
              >
                <div>
                  <div className="font-display font-medium text-lg tracking-wide">{member.name}</div>
                </div>
                <div>
                  {isPaid ? (
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1 opacity-70">
                      <Check size={14} /> PAID
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1 text-[var(--color-accent-mustard)]">
                      <Plus size={14} /> LOG
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* 3. Supplement Store Quick Log */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="w-full bg-[var(--color-block-1)] text-white px-6 py-6"
      >
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest opacity-80 mb-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-[var(--color-accent-terracotta)]">
            <ShoppingBag size={14} />
            <span>Supplement Store</span>
          </div>
          <span className="text-[10px] opacity-60">POS</span>
        </div>

        <div className="flex flex-col space-y-1 pb-10">
          {supplements.map((product, i) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              key={product.id}
              className="w-full px-4 py-3 bg-[var(--color-block-2)] flex items-center justify-between"
            >
              <div>
                <span className="font-display font-medium tracking-wide block text-white/90">
                  {product.name}
                </span>
                <span className="text-[10px] font-mono opacity-60 block mt-0.5 text-[var(--color-accent-mustard)]">
                  {formatARS(product.defaultPrice)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleLogSupplement(product.name, product.defaultPrice)}
                className="px-3 py-1.5 bg-[var(--color-block-3)] hover:bg-[var(--color-accent-terracotta)] hover:text-white text-[10px] font-mono uppercase tracking-widest font-bold transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus size={12} /> ADD
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
