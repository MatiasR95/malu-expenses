import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { X, Plus, Sparkles, Check } from 'lucide-react';

interface CustomCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  'Coffee',
  'Plane',
  'Shirt',
  'Gift',
  'Car',
  'HeartPulse',
  'Sparkles',
  'Wrench',
  'Gamepad2',
  'Book',
  'Dog',
  'Smartphone',
  'ShoppingBag',
  'Dumbbell',
  'Utensils',
];

const AVAILABLE_COLORS = [
  '#f43f5e', // Rose
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#eab308', // Yellow
  '#f97316', // Orange
];

export const CustomCategoryModal: React.FC<CustomCategoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addCategory } = useFinance();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Sparkles');
  const [selectedColor, setSelectedColor] = useState('#a855f7');
  const [budget, setBudget] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCategory({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      pastelBg: `${selectedColor}20`,
      monthlyBudget: budget > 0 ? budget : undefined,
    });

    setName('');
    setBudget(0);
    onClose();
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
          className="relative w-full max-w-lg bg-[#0a0d14] border border-white/15 rounded-t-[36px] sm:rounded-[36px] p-6 shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-white flex items-center gap-2 font-display">
              <Sparkles size={18} className="text-purple-400" />
              <span>Create Custom Category</span>
            </h2>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Name Input */}
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 block mb-1 font-display">
                Category Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Pet Care, Tech Gadgets, Pharmacy..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/70 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>

            {/* Monthly Budget (Optional) */}
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 block mb-1 font-display">
                Monthly Target Budget ($ ARS, Optional)
              </label>
              <input
                type="number"
                placeholder="e.g., 80000"
                value={budget || ''}
                onChange={e => setBudget(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/70 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500 font-impact-num"
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 block mb-1.5 font-display">
                Select Icon
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1">
                {AVAILABLE_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-3 rounded-2xl border flex items-center justify-center transition-all ${
                      selectedIcon === icon
                        ? 'border-purple-400 bg-purple-500/25 text-white shadow-md'
                        : 'border-white/5 bg-white/[0.03] text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <CategoryIcon name={icon} size={20} color={selectedIcon === icon ? selectedColor : undefined} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatch */}
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 block mb-1.5 font-display">
                Select Color Palette
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {AVAILABLE_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition-transform ${
                      selectedColor === color ? 'scale-110 ring-2 ring-white' : 'opacity-70'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && <Check size={14} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xl shadow-purple-600/30 active:scale-98 transition-all font-display mt-2"
            >
              <Plus size={16} />
              <span>Create Category</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
