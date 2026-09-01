import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CreditCard, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrutalistBarcodeChart } from '../dashboard/BrutalistBarcodeChart';

interface Props {
  onOpenQuickAdd: (categoryId?: string) => void;
  onOpenCreditCardSplitter: () => void;
  onEditExpense: (expense: any) => void;
}

export const ExpenseAnalyticsScreen: React.FC<Props> = ({ onOpenCreditCardSplitter }) => {
  const { monthlySummary, userFilter } = useFinance();

  const formatARS = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Prepare data for barcode chart
  const barcodeData = Object.entries(monthlySummary.byCategory).map(([catId, amount]) => ({
    label: catId,
    value: amount
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="w-full flex flex-col min-h-[100vh] bg-[var(--color-bg-sage)]">
      {/* 1. Month Overview - Sage Background, Dark text */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full px-6 pt-2 pb-6 text-[var(--color-ink)] overflow-hidden"
      >
        <div className="text-[11px] font-mono uppercase tracking-widest opacity-60 mb-1">
          {userFilter === 'all' ? 'Total Spent' : `${userFilter}'s Expenses`}
        </div>
        <div className="font-display font-medium text-4xl sm:text-5xl md:text-6xl tracking-normal flex items-baseline whitespace-nowrap overflow-hidden">
          <span className="text-2xl sm:text-3xl mr-1 opacity-70">$</span>
          <span>{Math.floor(monthlySummary.totalExpenses).toLocaleString()}</span>
          <span className="decimal-outline text-3xl sm:text-4xl ml-1">.0</span>
        </div>
        
        {/* New Barcode Chart */}
        {barcodeData.length > 0 && (
          <BrutalistBarcodeChart data={barcodeData} />
        )}
      </motion.div>

      {/* 2. Terracotta Action Block for Credit Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="px-6 mb-4 mt-2"
      >
        <button
          onClick={onOpenCreditCardSplitter}
          className="w-full flush-block bg-[var(--color-accent-terracotta)] text-white p-5 flex items-center justify-between hover:brightness-110 active:brightness-90 transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            <CreditCard size={20} />
            <div className="flex flex-col text-left">
              <span className="font-display text-xl font-medium tracking-wide">Split CC Batch</span>
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-80">
                Paste statement text
              </span>
            </div>
          </div>
          <ArrowRight size={20} />
        </button>
      </motion.div>

      {/* 3. Category Breakdown Stacked Blocks */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="w-full bg-[var(--color-block-2)] text-white mt-2 pb-20 rounded-t-xl shadow-2xl flex-1"
      >
        <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between text-xs font-mono uppercase tracking-widest opacity-80">
          <span>Categories</span>
          <span>{monthlySummary.monthName}</span>
        </div>
        
        <div className="flex flex-col">
          {Object.entries(monthlySummary.byCategory).map(([catId, amount], i) => {
            const percentage = monthlySummary.totalExpenses > 0 ? (amount / monthlySummary.totalExpenses) * 100 : 0;
            return (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                key={catId} 
                className={`px-6 py-4 flex items-center justify-between border-b border-black/10 ${i % 2 === 0 ? 'bg-[var(--color-block-2)]' : 'bg-[var(--color-block-3)]'}`}
              >
                <div className="flex flex-col">
                  <span className="font-display text-lg tracking-wide capitalize">{catId}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest opacity-60 mt-0.5">
                    {Math.round(percentage)}% of total
                  </span>
                </div>
                <div className="font-display text-xl tracking-wide font-semibold text-[var(--color-accent-mustard)]">
                  {formatARS(amount)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
