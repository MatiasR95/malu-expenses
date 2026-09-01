import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatARS } from '../../utils/currency';
import { USER_PROFILES } from '../../data/initialData';
import { Expense } from '../../types/finance';
import { Plus, Tag, Search, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseListProps {
  onOpenQuickAdd: (categoryId?: string) => void;
  onOpenCustomCategory: () => void;
  onOpenManageCategories?: () => void;
  onEditExpense: (expense: Expense) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  onOpenQuickAdd,
  onOpenCustomCategory,
  onOpenManageCategories,
  onEditExpense,
}) => {
  const { expenses, categories, monthlySummary } = useFinance();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const monthlyExpenses = expenses.filter(e => e.date.startsWith(monthlySummary.monthKey));

  let filteredExpenses = selectedCategoryFilter
    ? monthlyExpenses.filter(e => e.categoryId === selectedCategoryFilter)
    : monthlyExpenses;

  if (searchQuery.trim()) {
    filteredExpenses = filteredExpenses.filter(e =>
      (e.note || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.categoryId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  return (
    <div className="space-y-4">
      {/* Category Pills Horizontal Carousel */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold tracking-wider text-white/50 uppercase flex items-center gap-1.5 font-display">
            <Tag size={13} />
            Categories
          </h3>
          <div className="flex items-center gap-2">
            {onOpenManageCategories && (
              <button
                onClick={onOpenManageCategories}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
              >
                Manage
              </button>
            )}
            <button
              onClick={onOpenCustomCategory}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <Plus size={12} />
              New
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          <button
            onClick={() => setSelectedCategoryFilter(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border ${
              selectedCategoryFilter === null
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            All ({monthlyExpenses.length})
          </button>

          {categories.map(cat => {
            const totalInCat = monthlySummary.byCategory[cat.id] || 0;
            const isSelected = selectedCategoryFilter === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(isSelected ? null : cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'text-white shadow-lg'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                }`}
                style={{
                  backgroundColor: isSelected ? `${cat.color}25` : undefined,
                  borderColor: isSelected ? cat.color : undefined,
                }}
              >
                <CategoryIcon name={cat.icon} size={13} color={cat.color} />
                <span>{cat.name}</span>
                {totalInCat > 0 && (
                  <span className="text-[10px] opacity-70 font-impact-num">
                    {formatARS(totalInCat, { compact: true })}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses Feed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold tracking-wider text-white/50 uppercase font-display">
            Expense Ledger (Tap to edit)
          </h3>
          <span className="text-sm font-bold font-impact-num text-rose-400">
            {formatARS(
              filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0)
            )}
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-3 text-white/40" />
          <input
            type="text"
            placeholder="Search by note or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-500"
          />
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-12 px-4 rounded-3xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-sm font-bold text-white/70 font-display">No expenses found</p>
            <p className="text-xs text-white/40 mt-1 mb-4">
              Tap + button to log an expense for this month
            </p>
            <button
              onClick={() => onOpenQuickAdd(selectedCategoryFilter || undefined)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all font-display"
            >
              <Plus size={14} />
              Log Expense
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredExpenses.map((exp, index) => {
                const cat = categoryMap.get(exp.categoryId);
                const logger = USER_PROFILES[exp.loggedBy];

                return (
                  <motion.div
                    key={exp.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    onClick={() => onEditExpense(exp)}
                    className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/12 transition-all shadow-sm cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${cat?.color || '#ffffff'}15`,
                          borderColor: `${cat?.color || '#ffffff'}25`,
                        }}
                      >
                        <CategoryIcon
                          name={cat?.icon || 'Tag'}
                          size={18}
                          color={cat?.color || '#ffffff'}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white/95 truncate font-display">
                            {cat?.name || 'Expense'}
                          </span>
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full border border-white/10 shrink-0"
                            style={{
                              backgroundColor: `${logger?.color}20`,
                              color: logger?.color,
                            }}
                          >
                            {logger?.avatar} {logger?.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5 truncate">
                          {exp.note ? (
                            <span className="text-white/80 font-medium truncate">{exp.note}</span>
                          ) : null}
                          <span>{exp.paymentMethod.toUpperCase()}</span>
                          <span>·</span>
                          <span>{exp.date.split('-')[1]}/{exp.date.split('-')[2]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold font-impact-num text-rose-300">
                        -{formatARS(exp.amount)}
                      </span>

                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:text-white group-hover:bg-white/10 transition-colors">
                        <Edit3 size={12} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
