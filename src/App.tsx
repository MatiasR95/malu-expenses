import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { DynamicIslandPill } from './components/layout/DynamicIslandPill';
import { HomeScreen } from './components/screens/HomeScreen';
import { ScreenSkeleton } from './components/screens/ScreenSkeleton';
import { DeferredSheet } from './components/common/DeferredSheet';
import { AppTab, Expense, Income } from './types/finance';
/* Type-only, so naming it here does not pull the hub's chunk into the entry. */
import type { HubAction } from './components/modals/ActionHubModal';

/**
 * Code splitting.
 *
 * Home is the landing screen and stays in the entry chunk. Everything else --
 * the two other screens and all eight sheets -- is reached by a deliberate tap
 * and had no business being parsed on first paint: the sheets alone are the
 * larger half of the app's source, and a cold load was downloading the
 * category editor, the supplement catalogue and the statement parser before it
 * could show anyone their balance.
 *
 * Every module here exports by name, so each import is mapped onto the default
 * shape `lazy` expects.
 */
const IncomeDashboardScreen = lazy(() =>
  import('./components/screens/IncomeDashboardScreen').then((m) => ({
    default: m.IncomeDashboardScreen,
  }))
);
const ExpenseAnalyticsScreen = lazy(() =>
  import('./components/screens/ExpenseAnalyticsScreen').then((m) => ({
    default: m.ExpenseAnalyticsScreen,
  }))
);

const ActionHubModal = lazy(() =>
  import('./components/modals/ActionHubModal').then((m) => ({ default: m.ActionHubModal }))
);
const QuickAddModal = lazy(() =>
  import('./components/modals/QuickAddModal').then((m) => ({ default: m.QuickAddModal }))
);
const CreditCardSplitterModal = lazy(() =>
  import('./components/modals/CreditCardSplitterModal').then((m) => ({
    default: m.CreditCardSplitterModal,
  }))
);
const CategoriesModal = lazy(() =>
  import('./components/modals/CategoriesModal').then((m) => ({ default: m.CategoriesModal }))
);
const SupplementsModal = lazy(() =>
  import('./components/modals/SupplementsModal').then((m) => ({ default: m.SupplementsModal }))
);
const EditExpenseModal = lazy(() =>
  import('./components/modals/EditExpenseModal').then((m) => ({ default: m.EditExpenseModal }))
);
const EditIncomeModal = lazy(() =>
  import('./components/modals/EditIncomeModal').then((m) => ({ default: m.EditIncomeModal }))
);
const AutomatedBankSyncModal = lazy(() =>
  import('./components/modals/AutomatedBankSyncModal').then((m) => ({
    default: m.AutomatedBankSyncModal,
  }))
);

/** Tab order, so a screen change can travel in the direction you tapped. */
const TAB_ORDER: AppTab[] = ['cockpit', 'force_gym', 'analytics'];

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, resetToSampleData } = useFinance();

  const [isActionHubOpen, setIsActionHubOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<'expense' | 'income'>('expense');
  const [quickAddCategoryId, setQuickAddCategoryId] = useState<string | undefined>();
  const [isCreditCardSplitterOpen, setIsCreditCardSplitterOpen] = useState(false);
  const [isBankSyncOpen, setIsBankSyncOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSupplementsOpen, setIsSupplementsOpen] = useState(false);
  const [selectedEditingExpense, setSelectedEditingExpense] = useState<Expense | null>(null);
  const [selectedEditingIncome, setSelectedEditingIncome] = useState<Income | null>(null);

  // Travel direction for the screen swap: +1 rightwards, -1 back.
  const prevIndex = useRef(TAB_ORDER.indexOf(activeTab));
  const index = TAB_ORDER.indexOf(activeTab);
  const direction = index >= prevIndex.current ? 1 : -1;
  prevIndex.current = index;

  // Each tab is its own view; landing halfway down it because the last tab was
  // scrolled is disorienting.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  const handleOpenQuickAdd = (mode: 'expense' | 'income' = 'expense', categoryId?: string) => {
    setQuickAddMode(mode);
    setQuickAddCategoryId(categoryId);
    setIsQuickAddOpen(true);
  };

  const handleActionHubSelect = (action: HubAction) => {
    if (action === 'quick_expense') handleOpenQuickAdd('expense');
    else if (action === 'quick_income') handleOpenQuickAdd('income');
    else if (action === 'gym_dues') setActiveTab('force_gym');
    else if (action === 'cc_splitter') setIsCreditCardSplitterOpen(true);
  };

  return (
    <div className="min-h-dvh bg-[var(--color-sage)] text-[var(--color-ink)] flex flex-col relative">
      <DynamicIslandPill />
      <Header />

      <main
        className="flex-1 max-w-md w-full mx-auto relative z-10 flex flex-col"
        style={{ paddingBottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom) + 1.5rem)' }}
      >
        {/* Enter-only transition, no AnimatePresence.
            `mode="wait"` will not mount the incoming screen until the outgoing
            one reports its exit finished, and in this tree that report did not
            always arrive -- tapping a tab moved the nav highlight and the
            active-tab state while the screen underneath stayed put. Keying the
            wrapper on the tab lets React drop the old screen immediately and
            animate the new one in, which is what a tab bar should do anyway:
            the destination slides in, the origin does not linger. */}
        <div
          key={activeTab}
          style={{ '--slide-from': `${direction * 20}px` } as React.CSSProperties}
          className="reveal-x flex-1 flex flex-col"
        >
          {activeTab === 'cockpit' && (
            <HomeScreen
              onEditExpense={setSelectedEditingExpense}
              onAdd={() => handleOpenQuickAdd('expense')}
              onSeeCategories={() => setActiveTab('analytics')}
            />
          )}

          {activeTab === 'force_gym' && (
            <Suspense fallback={<ScreenSkeleton />}>
              <IncomeDashboardScreen
                onOpenQuickAdd={(mode) => handleOpenQuickAdd(mode)}
                onEditIncome={setSelectedEditingIncome}
                onOpenSupplements={() => setIsSupplementsOpen(true)}
              />
            </Suspense>
          )}

          {activeTab === 'analytics' && (
            <Suspense fallback={<ScreenSkeleton />}>
              <ExpenseAnalyticsScreen
                onOpenQuickAdd={(catId) => handleOpenQuickAdd('expense', catId)}
                onOpenCreditCardSplitter={() => setIsCreditCardSplitterOpen(true)}
                onOpenCategories={() => setIsCategoriesOpen(true)}
              />
            </Suspense>
          )}
        </div>

        <footer className="pt-8 pb-2 px-5 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-3)]">
            <span className="w-1.5 h-1.5 bg-[var(--color-mustard)]" aria-hidden="true" />
            Malu · Confidential
          </span>
          <button
            onClick={resetToSampleData}
            className="text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5 h-9 px-1"
          >
            <RefreshCw size={11} />
            Reset data
          </button>
        </footer>
      </main>

      <BottomTabBar
        onOpenActionHub={() => setIsActionHubOpen(true)}
        onOpenBankSync={() => setIsBankSyncOpen(true)}
      />

      <DeferredSheet isOpen={isActionHubOpen}>
        <ActionHubModal
          isOpen={isActionHubOpen}
          onClose={() => setIsActionHubOpen(false)}
          onSelectAction={handleActionHubSelect}
        />
      </DeferredSheet>

      <DeferredSheet isOpen={isQuickAddOpen}>
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          initialCategoryId={quickAddCategoryId}
          initialMode={quickAddMode}
        />
      </DeferredSheet>

      <DeferredSheet isOpen={isCreditCardSplitterOpen}>
        <CreditCardSplitterModal
          isOpen={isCreditCardSplitterOpen}
          onClose={() => setIsCreditCardSplitterOpen(false)}
        />
      </DeferredSheet>

      <DeferredSheet isOpen={!!selectedEditingExpense}>
        <EditExpenseModal
          expense={selectedEditingExpense}
          isOpen={!!selectedEditingExpense}
          onClose={() => setSelectedEditingExpense(null)}
        />
      </DeferredSheet>

      <DeferredSheet isOpen={!!selectedEditingIncome}>
        <EditIncomeModal
          income={selectedEditingIncome}
          isOpen={!!selectedEditingIncome}
          onClose={() => setSelectedEditingIncome(null)}
        />
      </DeferredSheet>

      <DeferredSheet isOpen={isBankSyncOpen}>
        <AutomatedBankSyncModal
          isOpen={isBankSyncOpen}
          onClose={() => setIsBankSyncOpen(false)}
        />
      </DeferredSheet>

      <DeferredSheet isOpen={isCategoriesOpen}>
        <CategoriesModal
          isOpen={isCategoriesOpen}
          onClose={() => setIsCategoriesOpen(false)}
        />
      </DeferredSheet>

      <DeferredSheet isOpen={isSupplementsOpen}>
        <SupplementsModal
          isOpen={isSupplementsOpen}
          onClose={() => setIsSupplementsOpen(false)}
        />
      </DeferredSheet>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
