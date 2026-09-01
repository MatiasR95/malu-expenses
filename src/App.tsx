import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { DynamicIslandPill } from './components/layout/DynamicIslandPill';
import { HomeScreen } from './components/screens/HomeScreen';
import { IncomeDashboardScreen } from './components/screens/IncomeDashboardScreen';
import { ExpenseAnalyticsScreen } from './components/screens/ExpenseAnalyticsScreen';
import { ActionHubModal } from './components/modals/ActionHubModal';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { CreditCardSplitterModal } from './components/modals/CreditCardSplitterModal';
import { EditExpenseModal } from './components/modals/EditExpenseModal';
import { AutomatedBankSyncModal } from './components/modals/AutomatedBankSyncModal';
import { Expense } from './types/finance';
import { RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, resetToSampleData } = useFinance();

  const [isActionHubOpen, setIsActionHubOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<'expense' | 'income'>('expense');
  const [quickAddCategoryId, setQuickAddCategoryId] = useState<string | undefined>();
  const [isCreditCardSplitterOpen, setIsCreditCardSplitterOpen] = useState(false);
  const [isBankSyncOpen, setIsBankSyncOpen] = useState(false);
  const [selectedEditingExpense, setSelectedEditingExpense] = useState<Expense | null>(null);

  const handleOpenQuickAdd = (mode: 'expense' | 'income' = 'expense', categoryId?: string) => {
    setQuickAddMode(mode);
    setQuickAddCategoryId(categoryId);
    setIsQuickAddOpen(true);
  };

  const handleActionHubSelect = (action: 'quick_expense' | 'quick_income' | 'gym_dues' | 'cc_splitter') => {
    if (action === 'quick_expense') {
      handleOpenQuickAdd('expense');
    } else if (action === 'quick_income') {
      handleOpenQuickAdd('income');
    } else if (action === 'gym_dues') {
      setActiveTab('force_gym');
    } else if (action === 'cc_splitter') {
      setIsCreditCardSplitterOpen(true);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedEditingExpense(expense);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-sage)] text-[var(--color-ink)] flex flex-col relative overflow-x-hidden font-body font-medium">
      <DynamicIslandPill />

      <Header
        onOpenCreditCardSplitter={() => setIsCreditCardSplitterOpen(true)}
        onOpenBankSync={() => setIsBankSyncOpen(true)}
      />

      <main className="flex-1 max-w-md w-full mx-auto pb-28 relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'cockpit' && (
            <HomeScreen
              key="cockpit-screen"
              onEditExpense={handleEditExpense}
            />
          )}

          {activeTab === 'force_gym' && (
            <IncomeDashboardScreen 
              key="force-gym-screen"
              onOpenQuickAdd={(mode) => handleOpenQuickAdd(mode)}
            />
          )}

          {activeTab === 'analytics' && (
            <ExpenseAnalyticsScreen
              key="analytics-screen"
              onOpenQuickAdd={(catId) => handleOpenQuickAdd('expense', catId)}
              onOpenCreditCardSplitter={() => setIsCreditCardSplitterOpen(true)}
              onEditExpense={handleEditExpense}
            />
          )}
        </AnimatePresence>

        <footer className="pt-8 pb-4 text-center space-y-2 px-4 mt-auto">
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono opacity-50 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-mustard)]" />
            <span>MALU FINANCES</span>
            <span></span>
            <span className="opacity-70">CONFIDENTIAL</span>
          </div>
          <button
            onClick={resetToSampleData}
            className="text-[9px] font-mono opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center gap-1 mx-auto"
          >
            <RefreshCw size={10} />
            <span>Reset Database</span>
          </button>
        </footer>
      </main>

      <BottomTabBar 
        onOpenActionHub={() => setIsActionHubOpen(true)}
        onOpenBankSync={() => setIsBankSyncOpen(true)}
      />

      <ActionHubModal
        isOpen={isActionHubOpen}
        onClose={() => setIsActionHubOpen(false)}
        onSelectAction={handleActionHubSelect}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialCategoryId={quickAddCategoryId}
        initialMode={quickAddMode}
      />

      <CreditCardSplitterModal
        isOpen={isCreditCardSplitterOpen}
        onClose={() => setIsCreditCardSplitterOpen(false)}
      />

      <EditExpenseModal
        expense={selectedEditingExpense}
        isOpen={!!selectedEditingExpense}
        onClose={() => setSelectedEditingExpense(null)}
      />

      <AutomatedBankSyncModal
        isOpen={isBankSyncOpen}
        onClose={() => setIsBankSyncOpen(false)}
      />
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
