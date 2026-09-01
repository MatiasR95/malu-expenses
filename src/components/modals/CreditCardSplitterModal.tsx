import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { Plus, Trash2, Check, Clipboard, Sparkles } from 'lucide-react';
import { UserId } from '../../types/finance';
import { Sheet } from '../common/Sheet';
import { PRESS } from '../../lib/motion';

interface SplitItem {
  id: string;
  categoryId: string;
  amount: number;
  note: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditCardSplitterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { categories, addExpense } = useFinance();
  const [statementText, setStatementText] = useState('');
  const [loggedBy, setLoggedBy] = useState<UserId>('mati');

  const [splitItems, setSplitItems] = useState<SplitItem[]>([
    { id: '1', categoryId: categories[0]?.id || 'shopping', amount: 0, note: '' }
  ]);

  const handleAddItem = () => {
    setSplitItems([
      ...splitItems,
      { id: Date.now().toString(), categoryId: categories[0]?.id || 'shopping', amount: 0, note: '' }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setSplitItems(splitItems.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<SplitItem>) => {
    setSplitItems(splitItems.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleParseStatement = (text: string) => {
    setStatementText(text);
    
    // Very naive regex parser for demonstration (e.g. COTO $55.000)
    const lines = text.split('\n');
    const newItems: SplitItem[] = [];
    
    lines.forEach((line, idx) => {
      const amountMatch = line.match(/\$?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
      if (amountMatch) {
        const amountStr = amountMatch[1].replace(/\./g, '').replace(',', '.');
        const amount = parseFloat(amountStr) || 0;
        
        let matchedCatId = categories[0]?.id;
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('coto') || lowerLine.includes('carrefour') || lowerLine.includes('jumbo')) {
          matchedCatId = 'supermarket';
        } else if (lowerLine.includes('ypf') || lowerLine.includes('shell') || lowerLine.includes('axion')) {
          matchedCatId = 'transport';
        } else if (lowerLine.includes('netflix') || lowerLine.includes('spotify')) {
          matchedCatId = 'entertainment';
        } else if (lowerLine.includes('farmacity')) {
          matchedCatId = 'health';
        }
        
        const note = line.replace(amountMatch[0], '').trim();
        
        newItems.push({
          id: Date.now().toString() + idx,
          categoryId: matchedCatId || categories[0]?.id || 'shopping',
          amount,
          note: note || 'Auto-parsed item'
        });
      }
    });

    if (newItems.length > 0) {
      setSplitItems(newItems);
    }
  };

  const totalSplit = splitItems.reduce((acc, item) => acc + (item.amount || 0), 0);

  const formatARS = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePostAllExpenses = () => {
    splitItems.forEach(item => {
      if (item.amount > 0) {
        addExpense({
          amount: item.amount,
          categoryId: item.categoryId,
          loggedBy,
          paymentMethod: 'credito',
          note: item.note || undefined,
          date: new Date().toISOString()
        });
      }
    });
    
    setSplitItems([{ id: '1', categoryId: categories[0]?.id || 'shopping', amount: 0, note: '' }]);
    setStatementText('');
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Card batch"
      subtitle="Split one statement into rows"
      tone="terracotta"
      footer={
        <motion.button
          type="button"
          whileTap={PRESS}
          onClick={handlePostAllExpenses}
          disabled={totalSplit <= 0}
          className="w-full h-14 bg-[var(--color-ink)] text-white font-mono font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-35"
        >
          <Check size={17} strokeWidth={3} />
          <span>Post {splitItems.length} {splitItems.length === 1 ? 'row' : 'rows'}</span>
        </motion.button>
      }
    >
      <div className="px-4 py-4">
        <div className="space-y-3">
            {/* Parser Input */}
            <div className="p-3 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-ink)] font-bold flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Auto-Parse Text
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const clip = await navigator.clipboard.readText();
                      handleParseStatement(clip);
                    } catch {
                      // Fallback
                    }
                  }}
                  className="text-[9px] font-mono text-[var(--color-ink)] hover:underline flex items-center gap-1 font-bold bg-[var(--color-accent-mustard)] px-2 py-1 border border-[var(--color-ink)]"
                >
                  <Clipboard size={10} /> Paste
                </button>
              </div>

              <input
                type="text"
                value={statementText}
                onChange={e => handleParseStatement(e.target.value)}
                placeholder="Paste statement lines (e.g. Coto $120.000)..."
                className="w-full bg-transparent border-b-2 border-[var(--color-ink)]/20 py-2 text-xs font-mono text-[var(--color-ink)] placeholder-[var(--color-ink)]/40 focus:outline-none focus:border-[var(--color-ink)]"
              />
            </div>

            {/* Total Block */}
            <div className="p-4 bg-[var(--color-ink)] text-white flex items-center justify-between shadow-[2px_2px_0_0_var(--color-accent-terracotta)]">
              <div>
                <span className="text-[10px] font-mono uppercase opacity-60 block">
                  Batch Total
                </span>
                <span className="text-2xl font-display font-bold">
                  {formatARS(totalSplit)}
                </span>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setLoggedBy('mati')}
                  className={`px-3 py-1.5 border-2 text-[10px] font-mono uppercase font-bold transition-all ${
                    loggedBy === 'mati' ? 'bg-[var(--color-accent-mustard)] text-[var(--color-ink)] border-[var(--color-ink)]' : 'border-transparent text-white/50'
                  }`}
                >
                  Mati
                </button>
                <button
                  type="button"
                  onClick={() => setLoggedBy('belu')}
                  className={`px-3 py-1.5 border-2 text-[10px] font-mono uppercase font-bold transition-all ${
                    loggedBy === 'belu' ? 'bg-[var(--color-accent-terracotta)] text-white border-[var(--color-ink)]' : 'border-transparent text-white/50'
                  }`}
                >
                  Belu
                </button>
              </div>
            </div>

            {/* Split Lines */}
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-ink)] font-bold">
                  Slices ({splitItems.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-[10px] font-mono uppercase tracking-widest font-bold text-[var(--color-ink)] flex items-center gap-1 hover:underline"
                >
                  <Plus size={12} /> Add Row
                </button>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {splitItems.map(item => {
                  return (
                    <div
                      key={item.id}
                      className="p-2 bg-[var(--color-paper-hi)] border-2 border-[var(--color-ink)] space-y-1"
                    >
                      <div className="flex items-center gap-1">
                        <select
                          value={item.categoryId}
                          onChange={e => handleUpdateItem(item.id, { categoryId: e.target.value })}
                          className="w-1/3 bg-transparent text-[9px] font-mono uppercase font-bold text-[var(--color-ink)] focus:outline-none border-b-2 border-[var(--color-ink)]/20 pb-1"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>

                        <div className="flex-1 flex items-center border-b-2 border-[var(--color-ink)]/20 pb-1">
                          <span className="text-[10px] text-[var(--color-ink)]/60 font-bold mr-1">$</span>
                          <input
                            type="number"
                            value={item.amount || ''}
                            onChange={e => handleUpdateItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-transparent font-display font-bold text-sm text-[var(--color-ink)] focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 hover:bg-[var(--color-accent-terracotta)] hover:text-white text-[var(--color-ink)] transition-colors border-2 border-transparent hover:border-[var(--color-ink)]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={item.note}
                        onChange={e => handleUpdateItem(item.id, { note: e.target.value })}
                        placeholder="Note..."
                        className="w-full bg-transparent px-1 py-1 text-[10px] font-mono text-[var(--color-ink)] placeholder-[var(--color-ink)]/30 outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

        </div>
      </div>
    </Sheet>
  );
};
