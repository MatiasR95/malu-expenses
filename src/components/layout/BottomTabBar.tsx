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
 * Two things were wrong with the previous rail and both were visible on a real
 * phone rather than in a desktop viewport:
 *
 * 1. `pb-[env(safe-area-inset-bottom)]` painted the rail's own background down
 *    into the gesture area, but nothing painted the strip *below* the fixed
 *    element. On iOS Safari the layout viewport and the visual viewport
 *    disagree while the toolbar animates, and on rubber-band overscroll the
 *    page pulls away from the rail entirely -- either way a band of sage paper
 *    showed under the ink block and the rail read as floating half off-screen.
 *    A tall ink underlay pinned at `top-full` now guarantees ink all the way
 *    to the physical bottom edge, whatever the browser thinks the viewport is.
 *
 * 2. Sync opens a sheet, it is not a destination, but it sat in the rail
 *    styled exactly like a tab -- so tapping it moved nothing and the rail
 *    looked broken. It is now marked as a dialog trigger, carries a live
 *    connection dot instead of an active rule, and is visually subordinate to
 *    the three real tabs.
 *
 * The one moving part remains the mustard rule that slides between tabs.
 */
export const BottomTabBar: React.FC<Props> = ({ onOpenActionHub, onOpenBankSync }) => {
  const { activeTab, setActiveTab, syncStatus, autoSyncEnabled } = useFinance();
  const reduce = useReducedMotion();

  const left: NavItem[] = [
    { key: 'cockpit', label: 'Home', icon: House, tab: 'cockpit' },
    { key: 'force_gym', label: 'Force', icon: Dumbbell, tab: 'force_gym' },
  ];

  const renderTab = (item: NavItem) => {
    const isActive = activeTab === item.tab;
    const Icon = item.icon;

    return (
      <motion.button
        key={item.key}
        type="button"
        whileTap={PRESS_HARD}
        aria-current={isActive ? 'page' : undefined}
        aria-label={item.label}
        onClick={() => item.tab && setActiveTab(item.tab)}
        className={`relative flex flex-col items-center justify-center gap-1 h-16 transition-colors duration-200 ${
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
        {/* The icon lifts a hair and firms up when selected. Scale rather than
            a size swap, so the row never reflows mid-transition. */}
        <motion.span
          animate={reduce ? undefined : { scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
          transition={SPRING_SNAP}
        >
          <Icon size={21} strokeWidth={isActive ? 2.25 : 1.6} />
        </motion.span>
        <span
          className={`text-[9px] font-mono uppercase tracking-[0.16em] leading-none transition-opacity duration-200 ${
            isActive ? 'opacity-100 font-bold' : 'opacity-80'
          }`}
        >
          {item.label}
        </span>
      </motion.button>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="on-dark fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-ink)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Ink underlay. Extends far below the rail so no browser chrome quirk,
          safe-area miscalculation or overscroll bounce can expose paper
          underneath the fixed bar. Pointer-events off: it must never eat a tap
          meant for the page. */}
      <span
        aria-hidden="true"
        className="absolute top-full left-0 right-0 h-40 bg-[var(--color-ink)] pointer-events-none"
      />

      {/* Machined edge: a mustard hairline reading as the top face of the
          block rather than the page simply running out. */}
      <span aria-hidden="true" className="absolute -top-px left-0 right-0 h-px bg-white/12" />

      <div className="max-w-md mx-auto grid grid-cols-5 items-stretch">
        {left.map(renderTab)}

        <div className="flex items-center justify-center px-1.5 py-1.5">
          <motion.button
            type="button"
            onClick={onOpenActionHub}
            whileTap={{ scale: 0.9 }}
            aria-label="Log a transaction"
            aria-haspopup="dialog"
            className="w-full h-[3.25rem] bg-[var(--color-mustard)] text-[var(--color-ink)] flex items-center justify-center shadow-[0_2px_0_0_var(--color-mustard-dp)] active:shadow-none active:translate-y-[2px] transition-shadow"
          >
            <Plus size={26} strokeWidth={2.5} />
          </motion.button>
        </div>

        {renderTab({ key: 'analytics', label: 'Data', icon: ChartPie, tab: 'analytics' })}

        {/* Sync is an action, not a destination: no active rule, and a status
            dot so the rail reports whether the bank feed is live instead of
            pretending to be a fourth tab. */}
        <motion.button
          type="button"
          whileTap={PRESS_HARD}
          onClick={onOpenBankSync}
          aria-label="Bank sync"
          aria-haspopup="dialog"
          className="relative flex flex-col items-center justify-center gap-1 h-16 text-white/45 hover:text-white/80 transition-colors duration-200"
        >
          <span className="relative">
            <Landmark size={21} strokeWidth={1.6} />
            <span
              aria-hidden="true"
              className={`absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full transition-colors ${
                syncStatus === 'syncing'
                  ? 'bg-[var(--color-mustard)] animate-pulse'
                  : syncStatus === 'error'
                    ? 'bg-[var(--color-terracotta)]'
                    : autoSyncEnabled
                      ? 'bg-[var(--color-mustard)]'
                      : 'bg-white/25'
              }`}
            />
          </span>
          <span className="text-[9px] font-mono uppercase tracking-[0.16em] leading-none opacity-80">
            Sync
          </span>
        </motion.button>
      </div>
    </nav>
  );
};
