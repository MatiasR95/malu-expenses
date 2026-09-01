import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Expense } from '../../types/finance';
import { format } from 'date-fns';
import { ShoppingBag, Heart, Coffee, Car, Utensils, Zap, Gamepad2, Home, Receipt, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onExpenseClick: (expense: Expense) => void;
}

const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'housing': return <Home size={14} strokeWidth={2} />;
    case 'food': return <Utensils size={14} strokeWidth={2} />;
    case 'transport': return <Car size={14} strokeWidth={2} />;
    case 'health': return <Heart size={14} strokeWidth={2} />;
    case 'entertainment': return <Gamepad2 size={14} strokeWidth={2} />;
    case 'shopping': return <ShoppingBag size={14} strokeWidth={2} />;
    case 'utilities': return <Zap size={14} strokeWidth={2} />;
    case 'coffee': return <Coffee size={14} strokeWidth={2} />;
    default: return <Receipt size={14} strokeWidth={2} />;
  }
};

const getBlockColor = (index: number) => {
  const colors = [
    'bg-[var(--color-block-1)] text-white/90', 
    'bg-[var(--color-block-2)] text-white/90',
    'bg-[var(--color-block-3)] text-white/90',
    'bg-[var(--color-block-4)] text-[var(--color-ink)]'
  ];
  return colors[index % colors.length];
};

export const RecentActivityLedger: React.FC<Props> = ({ onExpenseClick }) => {
  const { expenses, categories, userFilter } = useFinance();

  const filteredExpenses = expenses
    .filter(e => userFilter === 'all' || e.loggedBy === userFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  if (filteredExpenses.length === 0) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-[var(--color-block-2)] text-white/50 text-sm font-mono uppercase tracking-widest">
        No Activity
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {filteredExpenses.map((expense, i) => {
        const category = categories.find(c => c.id === expense.categoryId);
        const colorClasses = getBlockColor(i);
        const [intPart, decPart] = expense.amount.toFixed(1).split('.');
        
        // Mocking an "isIncome" flag for demonstration or if expenses array actually contains incomes
        // Real implementation depends on if `expenses` array holds both, but assuming standard Expense object
        // We will just use delicate ArrowUpRight for expense.
        const isExpense = true; 

        return (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onExpenseClick(expense)}
            className={`w-full px-6 py-5 flex items-center justify-between cursor-pointer hover:brightness-110 active:brightness-90 transition-all ${colorClasses}`}
          >
            {/* Left side: Category Pill + Title */}
            <div className="flex flex-col gap-1.5">
              <span className="font-display font-medium text-lg tracking-wide leading-tight flex items-center gap-2">
                {expense.note || category?.name || 'Expense'}
              </span>
              
              {/* Clever minimal category stamp */}
              <div className="flex items-center gap-1.5 opacity-60">
                <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center mix-blend-overlay">
                  {getCategoryIcon(expense.categoryId)}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest">
                  {category?.name || 'Uncategorized'}
                </span>
              </div>
            </div>

            {/* Right side: Amount + Delicate Indicator */}
            <div className="flex flex-col items-end">
              <div className="font-display font-semibold text-xl tracking-wide flex items-center">
                {/* Delicate arrow indicator for Expense vs Income */}
                {isExpense ? (
                  <ArrowUpRight size={14} strokeWidth={2} className="opacity-40 mr-1" />
                ) : (
                  <ArrowDownLeft size={14} strokeWidth={2} className="opacity-80 text-[var(--color-accent-mustard)] mr-1" />
                )}
                
                <span className="text-base mr-0.5 opacity-70">$</span>
                <span>{intPart}</span>
                <span className="text-base opacity-70">.{decPart}</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-1">
                {format(new Date(expense.date), 'hh:mm a')}
              </span>
            </div>
          </motion.div>
        );
      })}
      
      {/* Show More Block */}
      {expenses.length > 10 && (
        <button className="w-full py-5 bg-[var(--color-bg-sage)] text-[var(--color-ink)]/60 text-xs font-mono uppercase tracking-widest hover:bg-[var(--color-ink)]/5 transition-colors border-t border-[var(--color-ink)]/10">
          Show More
        </button>
      )}
    </div>
  );
};
