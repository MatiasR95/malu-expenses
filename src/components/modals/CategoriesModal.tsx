import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory } from '../../types/finance';
import { Sheet } from '../common/Sheet';
import { CategoryIcon, PICKER_ICONS } from '../common/CategoryIcon';
import { tick } from '../../utils/haptics';
import { PRESS, PRESS_HARD } from '../../lib/motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The MALU pastel suite the shipped categories already use.
 *
 * The old picker offered generic Tailwind rose/purple/indigo/cyan/lime, none of
 * which appear anywhere else in the app -- a category created through it stood
 * out against the twelve defaults rather than joining them.
 */
const SWATCHES = [
  '#C4E8D1', // mint
  '#BBDCC7', // sage
  '#C7DBF8', // signal blue
  '#B6C8F5', // sky
  '#DED2F9', // lilac
  '#E2D9F3', // lavender
  '#FBE4A0', // gold
  '#F8D896', // amber
  '#FDE5A8', // butter
  '#FBC3B8', // peach
  '#F7B5A8', // salmon
  '#F4DE9C', // cream
];

const FIELD =
  'w-full h-12 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] px-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none focus:block-shadow-sm transition-shadow';
const LABEL = 'text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)] block mb-1.5';

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

/**
 * Categories: create, rename, re-budget, delete.
 *
 * This replaces two separate modals that were both built and neither wired to
 * anything -- the only way to change a category was to edit
 * `src/data/initialData.ts` by hand. They were also split so that creating a
 * category meant closing the manage sheet to open a create sheet; merging them
 * removes that round trip and one whole component.
 */
export const CategoriesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { categories, monthlySummary, addCategory, updateCategory, deleteCategory } = useFinance();

  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState(0);

  // Create fields
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState(0);
  const [newIcon, setNewIcon] = useState('Sparkles');
  const [newColor, setNewColor] = useState(SWATCHES[0]);

  const spendByCategory = monthlySummary.byCategory;

  const reset = () => {
    setMode('list');
    setEditingId(null);
    setConfirmDeleteId(null);
    setNewName('');
    setNewBudget(0);
    setNewIcon('Sparkles');
    setNewColor(SWATCHES[0]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const startEdit = (cat: ExpenseCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditBudget(cat.monthlyBudget ?? 0);
    setConfirmDeleteId(null);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    updateCategory(editingId, {
      name: editName.trim(),
      monthlyBudget: editBudget > 0 ? editBudget : undefined,
    });
    setEditingId(null);
    tick(12);
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    deleteCategory(id);
    setConfirmDeleteId(null);
    setEditingId(null);
    tick(18);
  };

  const createCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCategory({
      name: newName.trim(),
      icon: newIcon,
      color: newColor,
      pastelBg: `${newColor}20`,
      monthlyBudget: newBudget > 0 ? newBudget : undefined,
    });
    reset();
    tick(18);
  };

  const canCreate = newName.trim().length > 0;

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
            form="create-category-form"
            whileTap={canCreate ? PRESS : undefined}
            disabled={!canCreate}
            className="flex-1 h-14 bg-[var(--color-ink)] text-white font-mono font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-35"
          >
            <Check size={17} strokeWidth={3} />
            {canCreate ? 'Create category' : 'Name it first'}
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
        New category
      </motion.button>
    );
  }, [mode, canCreate]);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'New category' : 'Categories'}
      subtitle={
        mode === 'create'
          ? 'Name, budget, icon, colour'
          : `${categories.length} in use · ${monthlySummary.monthName}`
      }
      tone="olive"
      footer={footer}
    >
      {mode === 'create' ? (
        <form id="create-category-form" onSubmit={createCategory} className="px-4 py-4 flex flex-col gap-5">
          <div>
            <label htmlFor="cat-name" className={LABEL}>Name</label>
            <input
              id="cat-name"
              type="text"
              required
              autoComplete="off"
              placeholder="Pharmacy, pet care, tools…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="cat-budget" className={LABEL}>Monthly budget (optional)</label>
            <input
              id="cat-budget"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="80000"
              value={newBudget || ''}
              onChange={(e) => setNewBudget(parseFloat(e.target.value) || 0)}
              className={`${FIELD} tabular`}
            />
          </div>

          <fieldset>
            <legend className={LABEL}>Icon</legend>
            <div className="grid grid-cols-6 gap-1.5">
              {PICKER_ICONS.map((icon) => {
                const isSelected = newIcon === icon;
                return (
                  <motion.button
                    key={icon}
                    type="button"
                    whileTap={PRESS_HARD}
                    aria-label={icon}
                    aria-pressed={isSelected}
                    onClick={() => setNewIcon(icon)}
                    className={`aspect-square flex items-center justify-center border-2 transition-colors duration-150 ${
                      isSelected
                        ? 'bg-[var(--color-ink)] border-[var(--color-ink)]'
                        : 'bg-[var(--color-paper-hi)] border-[var(--color-ink)]/12 text-[var(--color-ink-2)]'
                    }`}
                  >
                    <CategoryIcon
                      name={icon}
                      size={18}
                      color={isSelected ? newColor : undefined}
                      strokeWidth={isSelected ? 2 : 1.6}
                    />
                  </motion.button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className={LABEL}>Colour</legend>
            <div className="grid grid-cols-6 gap-1.5">
              {SWATCHES.map((color) => {
                const isSelected = newColor === color;
                return (
                  <motion.button
                    key={color}
                    type="button"
                    whileTap={PRESS_HARD}
                    aria-label={`Colour ${color}`}
                    aria-pressed={isSelected}
                    onClick={() => setNewColor(color)}
                    style={{ backgroundColor: color }}
                    className={`aspect-square flex items-center justify-center border-2 transition-colors duration-150 ${
                      isSelected ? 'border-[var(--color-ink)]' : 'border-transparent'
                    }`}
                  >
                    {isSelected && <Check size={15} strokeWidth={3} className="text-[var(--color-ink)]" />}
                  </motion.button>
                );
              })}
            </div>
          </fieldset>

          {/* Preview: what the row will look like in the ledger. */}
          <div>
            <span className={LABEL}>Preview</span>
            <div className="flex items-center gap-3.5 bg-[var(--color-olive-2)] text-white px-4 py-3.5">
              <span className="w-9 h-9 shrink-0 border border-white/25 flex items-center justify-center">
                <CategoryIcon name={newIcon} size={16} color={newColor} />
              </span>
              <span className="min-w-0 flex flex-col">
                <span className="font-display font-medium text-base tracking-wide truncate">
                  {newName.trim() || 'Untitled'}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-white/50 mt-0.5">
                  {newBudget > 0 ? `Budget ${money(newBudget)}` : 'No budget set'}
                </span>
              </span>
            </div>
          </div>
        </form>
      ) : (
        <ul className="px-4 py-4 flex flex-col gap-1.5">
          {categories.map((cat, i) => {
            const spent = spendByCategory[cat.id] ?? 0;
            const budget = cat.monthlyBudget ?? 0;
            const isEditing = editingId === cat.id;
            const isConfirming = confirmDeleteId === cat.id;
            const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
            const over = budget > 0 && spent > budget;

            return (
              <li
                key={cat.id}
                className="reveal-item bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)]/12"
                style={{ '--i': Math.min(i, 10) } as React.CSSProperties}
              >
                {isEditing ? (
                  <form onSubmit={saveEdit} className="p-3 flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-[var(--color-ink)]"
                        style={{ backgroundColor: `${cat.color}55` }}
                      >
                        <CategoryIcon name={cat.icon} size={18} />
                      </span>
                      <input
                        type="text"
                        aria-label="Category name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`${FIELD} !h-10`}
                      />
                    </div>

                    <div>
                      <label className={LABEL}>Monthly budget</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="No budget"
                        value={editBudget || ''}
                        onChange={(e) => setEditBudget(parseFloat(e.target.value) || 0)}
                        className={`${FIELD} !h-10 tabular`}
                      />
                    </div>

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
                        <span
                          className="w-10 h-10 shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}55` }}
                        >
                          <CategoryIcon name={cat.icon} size={18} />
                        </span>
                        <span className="min-w-0 flex flex-col">
                          <span className="font-display font-medium text-base leading-tight truncate">
                            {cat.name}
                          </span>
                          <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)] mt-0.5">
                            {money(spent)} spent
                            {budget > 0 && ` / ${money(budget)}`}
                          </span>
                        </span>
                      </span>

                      <span className="shrink-0 flex items-center gap-1">
                        <motion.button
                          type="button"
                          whileTap={PRESS_HARD}
                          onClick={() => startEdit(cat)}
                          aria-label={`Edit ${cat.name}`}
                          className="w-10 h-10 flex items-center justify-center text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ink)]/8 transition-colors"
                        >
                          <Pencil size={15} />
                        </motion.button>

                        {/* Only custom categories can go: the twelve defaults
                            are referenced by seeded and synced rows. */}
                        {cat.isCustom && (
                          <motion.button
                            type="button"
                            whileTap={PRESS_HARD}
                            onClick={() => handleDelete(cat.id)}
                            aria-label={
                              isConfirming ? `Confirm delete ${cat.name}` : `Delete ${cat.name}`
                            }
                            className={`h-10 flex items-center justify-center gap-1.5 transition-colors ${
                              isConfirming
                                ? 'px-3 bg-[var(--color-terracotta)] text-white text-[9px] font-mono uppercase tracking-[0.14em] font-bold'
                                : 'w-10 text-[var(--color-ink-3)] hover:text-[var(--color-terracotta-dp)] hover:bg-[var(--color-ink)]/8'
                            }`}
                          >
                            <Trash2 size={15} />
                            {isConfirming && <span>Sure?</span>}
                          </motion.button>
                        )}
                      </span>
                    </div>

                    {/* Deleting a category does not touch the expenses filed
                        under it -- they stay in the ledger and fall back to
                        showing the raw id. Say so before it happens. */}
                    {isConfirming && spent > 0 && (
                      <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-terracotta-dp)]">
                        {money(spent)} logged here this month will lose its label
                      </p>
                    )}

                    {budget > 0 && (
                      <div className="mt-2.5 w-full h-1.5 bg-[var(--color-ink)]/10 overflow-hidden">
                        <div
                          className="h-full transition-[width] duration-500 ease-out"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: over ? 'var(--color-terracotta)' : 'var(--color-ink)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}

          {/* Categories never reach the shared sheet -- worth saying once, here,
              rather than letting it be discovered as a bug. */}
          <li className="mt-2 px-1">
            <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)] leading-relaxed">
              Categories are stored on this device only. They do not sync to the
              shared ledger, so add them on each phone.
            </p>
          </li>
        </ul>
      )}
    </Sheet>
  );
};
