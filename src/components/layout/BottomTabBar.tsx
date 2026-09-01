import React from 'react';
import { House, Dumbbell, ChartPie, Plus, Landmark } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { AppTab } from '../../types/finance';
import { SPRING_SNAP, PRESS_HARD } from '../../lib/motion';

interface Props {
  onOpenActionHub: () => void;
  onOpenBankSync: () => void;
}

type NavItem = {
  key: string;
  label: string;
  icon: typeof House;
  tab?: AppTab;
  onPress?: () => void;
};

/**
 * The nav rail.
 *
 * Rebuilt as a single flush strip anchored to the bottom edge -- the old bar
 * floated on a gradient with a rotated diamond hanging over the content, which
 * collided with the ledger and left a sliver of page visible underneath it on
 * devices with a home indicator. Now: one solid ink rail, safe-area padded,
 * 56px targets, with the centre action built into the grid rather than
 * overhanging it. The one moving part is the mustard rule that slides to the
 * active tab.
 */
export const BottomTabBar: React.FC<Props> = ({ onOpenActionHub, onOpenBankSync }) => {
  const { activeTab, setActiveTab } = useFinance();
  const reduce = useReducedMotion();

  const left: NavItem[] = [
    { key: 'cockpit', label: 'Home', icon: House, tab: 'cockpit' },
    { key: 'force_gym', label: 'Force', icon: Dumbbell, tab: 'force_gym' },
  ];
  const right: NavItem[] = [
    { key: 'analytics', label: 'Data', icon: ChartPie, tab: 'analytics' },
    { key: 'sync', label: 'Sync', icon: Landmark, onPress: onOpenBankSync },
  ];

  const renderTab = (item: NavItem) => {
    const isActive = !!item.tab && activeTab === item.tab;
    const Icon = item.icon;

    return (
      <motion.button
        key={item.key}
        type="button"
        whileTap={PRESS_HARD}
        aria-current={isActive ? 'page' : undefined}
        aria-label={item.label}
        onClick={() => (item.tab ? setActiveTab(item.tab) : item.onPress?.())}
        className={`relative flex flex-col items-center justify-center gap-1 h-14 transition-colors duration-200 ${
          isActive ? 'text-[var(--color-mustard)]' : 'text-white/45 hover:text-white/80'
        }`}
      >
        {isActive && (
          <motion.span
            layoutId={reduce ? undefined : 'nav-active'}
            transition={SPRING_SNAP}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[3px] bg-[var(--color-mustard)]"
          />
        )}
        <Icon size={21} strokeWidth={isActive ? 2.25 : 1.6} />
        <span className="text-[9px] font-mono uppercase tracking-[0.16em] leading-none">
          {item.label}
        </span>
      </motion.button>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="on-dark fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-ink)] pb-[env(safe-area-inset-bottom)]"
    >
      {/* Hairline of paper above the rail, so the ink block reads as a machined
          edge rather than the page simply running out. */}
      <span className="absolute -top-px left-0 right-0 h-px bg-[var(--color-ink)]/15" />

      <div className="max-w-md mx-auto grid grid-cols-5 items-stretch">
        {left.map(renderTab)}

        <div className="flex items-center justify-center px-1.5 py-1.5">
          <motion.button
            type="button"
            onClick={onOpenActionHub}
            whileTap={{ scale: 0.9 }}
            aria-label="Log a transaction"
            className="w-full h-[3.25rem] bg-[var(--color-mustard)] text-[var(--color-ink)] flex items-center justify-center shadow-[0_2px_0_0_var(--color-mustard-dp)] active:shadow-none active:translate-y-[2px] transition-shadow"
          >
            <Plus size={26} strokeWidth={2.5} />
          </motion.button>
        </div>

        {right.map(renderTab)}
      </div>
    </nav>
  );
};
