import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { USER_PROFILES } from '../../data/initialData';
import { formatARS } from '../../utils/currency';
import { ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';

export const DynamicIslandPill: React.FC = () => {
  const { activeIslandEvent, dismissIslandEvent } = useFinance();

  return (
    <div className="fixed top-2 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <AnimatePresence>
        {activeIslandEvent && (
          <motion.div
            initial={{ y: -50, scale: 0.8, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -50, scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="pointer-events-auto max-w-sm w-full bg-[#000000] border border-white/[0.02] rounded-full px-4 py-2.5 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3"
          >
            {/* Left: Dynamic Animated Icon */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  activeIslandEvent.type === 'income_added'
                    ? 'bg-[#155EEF] text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {activeIslandEvent.type === 'income_added' ? (
                  <ArrowDownLeft size={14} />
                ) : (
                  <ArrowUpRight size={14} />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white truncate font-display">
                    {activeIslandEvent.title}
                  </span>
                  {activeIslandEvent.actor !== 'system' && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white/10 shrink-0"
                      style={{
                        backgroundColor: `${USER_PROFILES[activeIslandEvent.actor]?.color}20`,
                        color: USER_PROFILES[activeIslandEvent.actor]?.color,
                      }}
                    >
                      {USER_PROFILES[activeIslandEvent.actor]?.avatar} {USER_PROFILES[activeIslandEvent.actor]?.name}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/50 truncate">
                  {activeIslandEvent.subtitle}
                </p>
              </div>
            </div>

            {/* Right: Amount & Close Button */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-black font-impact-num ${
                  activeIslandEvent.type === 'income_added'
                    ? 'text-[#8FB0FA]'
                    : 'text-rose-400'
                }`}
              >
                {activeIslandEvent.type === 'income_added' ? '+' : '-'}{formatARS(activeIslandEvent.amount)}
              </span>

              <button
                onClick={dismissIslandEvent}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
