import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory } from '../../types/finance';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatARS } from '../../utils/currency';
import { X, Plus, Edit2, Trash2, Check, Tag } from 'lucide-react';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateNew: () => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateNew,
}) => {
  const { categories, monthlySummary, updateCategory, deleteCategory } = useFinance();
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState<number>(0);

  if (!isOpen) return null;

  const handleStartEdit = (cat: ExpenseCategory) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditBudget(cat.monthlyBudget || 0);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    updateCategory(editingCategory.id, {
      name: editName.trim(),
      monthlyBudget: editBudget > 0 ? editBudget : undefined,
    });

    setEditingCategory(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom category?')) {
      deleteCategory(id);
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
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[#0a0d14] border border-white/15 rounded-t-[36px] sm:rounded-[36px] p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-white flex items-center gap-2 font-display">
              <Tag size={18} className="text-purple-400" />
              <span>Category & Budget Management Studio</span>
            </h2>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateNew();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 font-black text-xs flex items-center justify-center gap-1.5 transition-all mb-3 font-display"
          >
            <Plus size={15} />
            <span>Create New Custom Category</span>
          </button>

          {/* Category List */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {categories.map(cat => {
              const totalSpent = monthlySummary.byCategory[cat.id] || 0;
              const budget = cat.monthlyBudget || 0;
              const isEditing = editingCategory?.id === cat.id;

              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 hover:bg-white/[0.05] transition-all"
                >
                  {isEditing ? (
                    <form onSubmit={handleSaveEdit} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={cat.icon} size={18} color={cat.color} />
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-white/40 uppercase font-bold block mb-1 font-display">
                          Monthly Estimated Budget ($ ARS)
                        </label>
                        <input
                          type="number"
                          value={editBudget || ''}
                          onChange={e => setEditBudget(parseFloat(e.target.value) || 0)}
                          placeholder="e.g., 100000"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-impact-num text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="py-1.5 px-3 rounded-xl bg-white/5 text-white/60 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md shadow-purple-600/30 font-display"
                        >
                          <Check size={14} />
                          <span>Save</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${cat.color}20` }}
                          >
                            <CategoryIcon name={cat.icon} size={16} color={cat.color} />
                          </div>
                          <div>
                            <span className="font-black text-xs text-white/90 block font-display">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-white/40">
                              Spent: {formatARS(totalSpent, { compact: true })}
                              {budget > 0 ? ` / Target: ${formatARS(budget, { compact: true })}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            title="Edit category"
                          >
                            <Edit2 size={13} />
                          </button>

                          {cat.isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDelete(cat.id)}
                              className="text-white/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Delete custom category"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {budget > 0 && (
                        <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.round((totalSpent / budget) * 100))}%`,
                              backgroundColor: totalSpent > budget ? '#ef4444' : cat.color,
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
