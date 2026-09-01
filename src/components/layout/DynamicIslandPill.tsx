import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { USER_PROFILES } from '../../data/initialData';
import { formatARS } from '../../utils/currency';
import { SPRING_SNAP, PRESS_HARD } from '../../lib/motion';

/**
 * Confirmation toast for anything that just hit the ledger.
 *
 * Restyled onto the app's own system. It was carrying a different design
 * language entirely -- a fully rounded black pill with `#155EEF` blue and rose
 * accents from the MALU brand kit, plus a `font-impact-num` class that no
 * stylesheet here defines -- so the one element that appears at the moment you
 * complete an action looked like it belonged to another product. Now: ink
 * block, square corners, mustard for money in and terracotta for money out.
 */
export const DynamicIslandPill: React.FC = () => {
  const { activeIslandEvent, dismissIslandEvent } = useFinance();

  useEffect(() => {
    if (!activeIslandEvent) return;
    const timer = setTimeout(dismissIslandEvent, 3200);
    return () => clearTimeout(timer);
  }, [activeIslandEvent, dismissIslandEvent]);

  const isIncome = activeIslandEvent?.type === 'income_added';
  const actor =
    activeIslandEvent && activeIslandEvent.actor !== 'system'
      ? USER_PROFILES[activeIslandEvent.actor]
      : null;

  return (
    <div
      /* Clears the sticky masthead rather than landing on top of it. */
      className="fixed left-0 right-0 z-[60] flex justify-center pointer-events-none px-4"
      style={{ top: 'calc(max(env(safe-area-inset-top), 0.5rem) + 4.25rem)' }}
      aria-live="polite"
    >
      <AnimatePresence>
        {activeIslandEvent && (
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={SPRING_SNAP}
            className="on-dark pointer-events-auto w-full max-w-md bg-[var(--color-ink)] text-white px-3.5 py-3 shadow-[0_8px_24px_-8px_rgba(21,22,19,0.55)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`w-8 h-8 shrink-0 flex items-center justify-center ${
                  isIncome
                    ? 'bg-[var(--color-mustard)] text-[var(--color-ink)]'
                    : 'bg-[var(--color-terracotta)] text-white'
                }`}
              >
                {isIncome ? <ArrowDownLeft size={15} strokeWidth={2.5} /> : <ArrowUpRight size={15} strokeWidth={2.5} />}
              </span>

              {/* Actor sits on the metadata line, not beside the title: on a
                  375px toast a chip next to the heading clipped it to three
                  words. */}
              <span className="min-w-0 flex flex-col">
                <span className="font-display font-medium text-sm truncate">
                  {activeIslandEvent.title}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-white/45 mt-0.5 min-w-0">
                  {actor && <span className="shrink-0 text-white/70">{actor.name}</span>}
                  {actor && <span className="shrink-0 opacity-50">/</span>}
                  <span className="truncate">{activeIslandEvent.subtitle}</span>
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`font-display font-semibold text-sm tabular ${
                  isIncome ? 'text-[var(--color-mustard)]' : 'text-[var(--color-terracotta)]'
                }`}
              >
                {isIncome ? '+' : '-'}
                {formatARS(activeIslandEvent.amount)}
              </span>

              <motion.button
                type="button"
                onClick={dismissIslandEvent}
                whileTap={PRESS_HARD}
                aria-label="Dismiss"
                className="w-8 h-8 -mr-1.5 flex items-center justify-center text-white/45 hover:text-white transition-colors"
              >
                <X size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
