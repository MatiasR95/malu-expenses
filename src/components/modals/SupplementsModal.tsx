import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SupplementProduct } from '../../types/finance';
import { Sheet } from '../common/Sheet';
import { CategoryIcon } from '../common/CategoryIcon';
import { tick } from '../../utils/haptics';
import { PRESS, PRESS_HARD } from '../../lib/motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: SupplementProduct['category']; label: string; icon: string }[] = [
  { id: 'proteinas', label: 'Protein', icon: 'Dumbbell' },
  { id: 'creatinas', label: 'Creatine', icon: 'Zap' },
  { id: 'pre_entreno', label: 'Pre-workout', icon: 'Flame' },
  { id: 'barras', label: 'Bars', icon: 'Candy' },
  { id: 'otros', label: 'Other', icon: 'Droplets' },
];

const ICON_PICKER = ['Dumbbell', 'Zap', 'Flame', 'Candy', 'Droplets', 'HeartPulse', 'Pill', 'Sparkles'];

const FIELD =
  'w-full h-12 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] px-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none focus:block-shadow-sm transition-shadow';
const LABEL = 'text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] block mb-1.5';

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

/**
 * Supplement store products: create, rename, reprice, delete.
 *
 * The "Sell" tiles on the income screen used to read from a hardcoded array
 * baked into that component -- three stale products with prices nobody had
 * touched in months, disconnected from `supplements` in FinanceContext, which
 * already had five real ones and no screen that could edit them. This is that
 * screen, built the same way CategoriesModal manages categories.
 */
export const SupplementsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { supplements, addSupplementProduct, updateSupplementProduct, deleteSupplementProduct } = useFinance();

  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editCategory, setEditCategory] = useState<SupplementProduct['category']>('otros');
  const [editIcon, setEditIcon] = useState('Dumbbell');

  // Create fields
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [newCategory, setNewCategory] = useState<SupplementProduct['category']>('otros');
  const [newIcon, setNewIcon] = useState('Dumbbell');

  const reset = () => {
    setMode('list');
    setEditingId(null);
    setConfirmDeleteId(null);
    setNewName('');
    setNewPrice(0);
    setNewCategory('otros');
    setNewIcon('Dumbbell');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const startEdit = (product: SupplementProduct) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(product.defaultPrice);
    setEditCategory(product.category);
    setEditIcon(product.icon);
    setConfirmDeleteId(null);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    updateSupplementProduct(editingId, {
      name: editName.trim(),
      defaultPrice: editPrice,
      category: editCategory,
      icon: editIcon,
    });
    setEditingId(null);
    tick(12);
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    deleteSupplementProduct(id);
    setConfirmDeleteId(null);
    setEditingId(null);
    tick(18);
  };

  const createProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addSupplementProduct({
      name: newName.trim(),
      defaultPrice: newPrice,
      category: newCategory,
      icon: newIcon,
    });
    reset();
    tick(18);
  };

  const canCreate = newName.trim().length > 0;

  const IconPicker: React.FC<{
    value: string;
    onChange: (icon: string) => void;
  }> = ({ value, onChange }) => (
    <fieldset>
      <legend className={LABEL}>Icon</legend>
      <div className="grid grid-cols-8 gap-1.5">
        {ICON_PICKER.map((icon) => {
          const isSelected = value === icon;
          return (
            <motion.button
              key={icon}
              type="button"
              whileTap={PRESS_HARD}
              aria-label={icon}
              aria-pressed={isSelected}
              onClick={() => onChange(icon)}
              className={`aspect-square flex items-center justify-center border-2 transition-colors duration-150 ${
                isSelected
                  ? 'bg-[var(--color-ink)] border-[var(--color-ink)] text-[var(--color-mustard)]'
                  : 'bg-[var(--color-paper-hi)] border-[var(--color-ink)]/12 text-[var(--color-ink-2)]'
              }`}
            >
              <CategoryIcon name={icon} size={16} strokeWidth={isSelected ? 2 : 1.6} />
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );

  const CategoryPicker: React.FC<{
    value: SupplementProduct['category'];
    onChange: (c: SupplementProduct['category']) => void;
  }> = ({ value, onChange }) => (
    <fieldset>
      <legend className={LABEL}>Category</legend>
      <div className="grid grid-cols-3 gap-1.5">
        {CATEGORIES.map((c) => {
          const isSelected = value === c.id;
          return (
            <motion.button
              key={c.id}
              type="button"
              whileTap={PRESS}
              aria-pressed={isSelected}
              onClick={() => onChange(c.id)}
              className={`h-11 px-2 text-[10px] font-mono uppercase tracking-[0.1em] font-bold border-2 transition-colors duration-150 ${
                isSelected
                  ? 'bg-[var(--color-ink)] text-[var(--color-mustard)] border-[var(--color-ink)]'
                  : 'bg-[var(--color-paper-hi)] text-[var(--color-ink-2)] border-[var(--color-ink)]/15'
              }`}
            >
              {c.label}
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );

  const footer = useMemo(() => {
    if (mode === 'create') {
      return (
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={PRESS}
            onClick={reset}
            className="h-14 px-5 bg-[var(--color-ink)]/10 text-[var(--color-ink-2)] font-mono font-bold text-[10px] uppercase tracking-[0.16em]"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            form="create-supplement-form"
            whileTap={canCreate ? PRESS : undefined}
            disabled={!canCreate}
            className="flex-1 h-14 bg-[var(--color-ink)] text-white font-mono font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-35"
          >
            <Check size={17} strokeWidth={3} />
            {canCreate ? 'Add product' : 'Name it first'}
          </motion.button>
        </div>
      );
    }
    return (
      <motion.button
        type="button"
        whileTap={PRESS}
        onClick={() => { setMode('create'); setEditingId(null); setConfirmDeleteId(null); }}
        className="w-full h-14 bg-[var(--color-ink)] text-[var(--color-mustard)] font-mono font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
      >
        <Plus size={17} strokeWidth={3} />
        New product
      </motion.button>
    );
  }, [mode, canCreate]);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'New product' : 'Supplement store'}
      subtitle={mode === 'create' ? 'Name, price, category, icon' : `${supplements.length} products`}
      tone="olive"
      footer={footer}
    >
      {mode === 'create' ? (
        <form id="create-supplement-form" onSubmit={createProduct} className="px-4 py-4 flex flex-col gap-5">
          <div>
            <label htmlFor="sup-name" className={LABEL}>Name</label>
            <input
              id="sup-name"
              type="text"
              required
              autoComplete="off"
              placeholder="Whey Protein (1kg)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="sup-price" className={LABEL}>Price</label>
            <input
              id="sup-price"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="42000"
              value={newPrice || ''}
              onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
              className={`${FIELD} tabular`}
            />
          </div>

          <CategoryPicker value={newCategory} onChange={setNewCategory} />
          <IconPicker value={newIcon} onChange={setNewIcon} />

          <div>
            <span className={LABEL}>Preview</span>
            <div className="flex items-center gap-3.5 bg-[var(--color-olive-2)] text-white px-4 py-3.5">
              <span className="w-9 h-9 shrink-0 border border-white/25 flex items-center justify-center">
                <CategoryIcon name={newIcon} size={16} />
              </span>
              <span className="min-w-0 flex flex-col">
                <span className="font-display font-medium text-base tracking-wide truncate">
                  {newName.trim() || 'Untitled'}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-white/50 mt-0.5">
                  {money(newPrice)}
                </span>
              </span>
            </div>
          </div>
        </form>
      ) : (
        <ul className="px-4 py-4 flex flex-col gap-1.5">
          {supplements.length === 0 && (
            <p className="text-center py-8 text-[var(--color-ink-3)] text-[11px] font-mono uppercase tracking-[0.16em]">
              No products yet
            </p>
          )}

          {supplements.map((product, i) => {
            const isEditing = editingId === product.id;
            const isConfirming = confirmDeleteId === product.id;

            return (
              <li
                key={product.id}
                className="reveal-item bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)]/12"
                style={{ '--i': Math.min(i, 10) } as React.CSSProperties}
              >
                {isEditing ? (
                  <form onSubmit={saveEdit} className="p-3 flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-[var(--color-ink)]">
                        <CategoryIcon name={editIcon} size={18} />
                      </span>
                      <input
                        type="text"
                        aria-label="Product name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`${FIELD} !h-10`}
                      />
                    </div>

                    <div>
                      <label className={LABEL}>Price</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={editPrice || ''}
                        onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                        className={`${FIELD} !h-10 tabular`}
                      />
                    </div>

                    <CategoryPicker value={editCategory} onChange={setEditCategory} />
                    <IconPicker value={editIcon} onChange={setEditIcon} />

                    <div className="flex gap-2">
                      <motion.button
                        type="button"
                        whileTap={PRESS}
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel"
                        className="w-11 h-11 flex items-center justify-center bg-[var(--color-ink)]/10 text-[var(--color-ink-2)]"
                      >
                        <X size={16} />
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileTap={PRESS}
                        className="flex-1 h-11 bg-[var(--color-ink)] text-white font-mono font-bold text-[10px] uppercase tracking-[0.16em] flex items-center justify-center gap-2"
                      >
                        <Check size={15} strokeWidth={3} /> Save
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-[var(--color-ink)]/8">
                          <CategoryIcon name={product.icon} size={18} />
                        </span>
                        <span className="min-w-0 flex flex-col">
                          <span className="font-display font-medium text-base leading-tight truncate">
                            {product.name}
                          </span>
                          <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)] mt-0.5">
                            {money(product.defaultPrice)}
                          </span>
                        </span>
                      </span>

                      <span className="shrink-0 flex items-center gap-1">
                        <motion.button
                          type="button"
                          whileTap={PRESS_HARD}
                          onClick={() => startEdit(product)}
                          aria-label={`Edit ${product.name}`}
                          className="w-10 h-10 flex items-center justify-center text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ink)]/8 transition-colors"
                        >
                          <Pencil size={15} />
                        </motion.button>

                        <motion.button
                          type="button"
                          whileTap={PRESS_HARD}
                          onClick={() => handleDelete(product.id)}
                          aria-label={isConfirming ? `Confirm delete ${product.name}` : `Delete ${product.name}`}
                          className={`h-10 flex items-center justify-center gap-1.5 transition-colors ${
                            isConfirming
                              ? 'px-3 bg-[var(--color-terracotta)] text-white text-[9px] font-mono uppercase tracking-[0.14em] font-bold'
                              : 'w-10 text-[var(--color-ink-3)] hover:text-[var(--color-terracotta-dp)] hover:bg-[var(--color-ink)]/8'
                          }`}
                        >
                          <Trash2 size={15} />
                          {isConfirming && <span>Sure?</span>}
                        </motion.button>
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}

          <li className="mt-2 px-1">
            <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)] leading-relaxed">
              Products are stored on this device only, same as categories. Past
              sales already logged keep the name and price they were sold at.
            </p>
          </li>
        </ul>
      )}
    </Sheet>
  );
};
