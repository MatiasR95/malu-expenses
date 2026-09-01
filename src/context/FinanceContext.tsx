import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppTab,
  Expense,
  ExpenseCategory,
  Income,
  LiveSyncEvent,
  MonthlySummary,
  PaymentPlatform,
  RecurringCommitment,
  SupplementProduct,
  UserFilter,
  UserId,
} from '../types/finance';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_RECURRING,
  DEFAULT_SUPPLEMENTS,
} from '../data/initialData';
import { formatARS, formatMonthName, getCurrentMonthKey } from '../utils/currency';
import { FinanceAPI, setApiUrl } from '../api/client';

interface BankConnectionState {
  connected: boolean;
  name: string;
  lastSync: string;
  count: number;
}

interface FinanceContextType {
  activeUser: UserId;
  setActiveUser: (user: UserId) => void;
  userFilter: UserFilter;
  setUserFilter: (filter: UserFilter) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  
  incomes: Income[];
  expenses: Expense[];
  categories: ExpenseCategory[];
  recurringCommitments: RecurringCommitment[];
  supplements: SupplementProduct[];
  liveEvents: LiveSyncEvent[];
  activeIslandEvent: LiveSyncEvent | null;
  dismissIslandEvent: () => void;

  autoSyncEnabled: boolean;
  toggleAutoSync: () => void;
  bankConnections: Record<PaymentPlatform, BankConnectionState>;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;

  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => Income;
  updateIncome: (id: string, income: Partial<Omit<Income, 'id' | 'createdAt'>>) => void;
  deleteIncome: (id: string) => void;

  addCategory: (category: Omit<ExpenseCategory, 'id'>) => ExpenseCategory;
  updateCategory: (id: string, category: Partial<Omit<ExpenseCategory, 'id'>>) => void;
  deleteCategory: (id: string) => void;

  toggleRecurringPaid: (recurringId: string, monthKey?: string) => void;
  addSupplementProduct: (supplement: Omit<SupplementProduct, 'id'>) => SupplementProduct;

  simulateInboundBankTransfer: (platform?: PaymentPlatform) => void;

  monthlySummary: MonthlySummary;
  allMonths: string[];
  triggerLiveSyncNotification: (event: Omit<LiveSyncEvent, 'id' | 'timestamp'>) => void;
  resetToSampleData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INCOMES: 'couple_finance_incomes_v5',
  EXPENSES: 'couple_finance_expenses_v5',
  CATEGORIES: 'couple_finance_categories_v5',
  RECURRING: 'couple_finance_recurring_v5',
  SUPPLEMENTS: 'couple_finance_supplements_v5',
  ACTIVE_USER: 'couple_finance_active_user_v5',
  USER_FILTER: 'couple_finance_user_filter_v5',
  ACTIVE_TAB: 'couple_finance_active_tab_v5',
  AUTO_SYNC: 'couple_finance_auto_sync_v5',
};

function getSeedIncomes(): Income[] {
  const currentMonth = getCurrentMonthKey();
  return [
    {
      id: 'inc-1',
      date: `${currentMonth}-01`,
      amount: 1450000,
      source: 'assurant',
      platform: 'galicia',
      notes: 'Assurant Base Salary (Banco Galicia)',
      createdBy: 'mati',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-2',
      date: `${currentMonth}-03`,
      amount: 45000,
      source: 'force_gym',
      platform: 'mercadopago',
      forceDetails: {
        type: 'cuota',
        memberName: 'Lucas Fernandez',
        notes: 'Monthly Full Pass',
      },
      createdBy: 'mati',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-3',
      date: `${currentMonth}-05`,
      amount: 45000,
      source: 'force_gym',
      platform: 'cuenta_dni',
      forceDetails: {
        type: 'cuota',
        memberName: 'Camila Rodriguez',
      },
      createdBy: 'mati',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-4',
      date: `${currentMonth}-07`,
      amount: 29000,
      source: 'force_gym',
      platform: 'mercadopago',
      forceDetails: {
        type: 'suplemento',
        productTag: 'Creatine Monohydrate (300g)',
        memberName: 'Federico Perez',
      },
      createdBy: 'mati',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-5',
      date: `${currentMonth}-09`,
      amount: 45000,
      source: 'force_gym',
      platform: 'lemon',
      forceDetails: {
        type: 'cuota',
        memberName: 'Gonzalo Rossi',
      },
      createdBy: 'mati',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-6',
      date: `${currentMonth}-11`,
      amount: 45000,
      source: 'force_gym',
      platform: 'galicia',
      forceDetails: {
        type: 'cuota',
        memberName: 'Julian Castro',
      },
      createdBy: 'mati',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-7',
      date: `${currentMonth}-13`,
      amount: 45000,
      source: 'force_gym',
      platform: 'mercadopago',
      forceDetails: {
        type: 'cuota',
        memberName: 'Agustin Navarro',
      },
      createdBy: 'mati',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-8',
      date: `${currentMonth}-14`,
      amount: 42000,
      source: 'force_gym',
      platform: 'cuenta_dni',
      forceDetails: {
        type: 'suplemento',
        productTag: 'Whey Protein (1kg)',
        memberName: 'Mariano Benitez',
      },
      createdBy: 'mati',
      createdAt: new Date().toISOString(),
    },
  ];
}

function getSeedExpenses(): Expense[] {
  const currentMonth = getCurrentMonthKey();
  return [
    {
      id: 'exp-1',
      date: `${currentMonth}-02`,
      amount: 380000,
      categoryId: 'alquiler',
      note: 'Apartment Rent & Garage',
      loggedBy: 'mati',
      paymentMethod: 'transferencia',
      isRecurring: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-2',
      date: `${currentMonth}-04`,
      amount: 65000,
      categoryId: 'expensas',
      note: 'Building HOA Maintenance',
      loggedBy: 'belu',
      paymentMethod: 'transferencia',
      isRecurring: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-3',
      date: `${currentMonth}-06`,
      amount: 54200,
      categoryId: 'supermercado',
      note: 'Weekly Grocery Haul',
      loggedBy: 'belu',
      paymentMethod: 'debito',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-4',
      date: `${currentMonth}-08`,
      amount: 16800,
      categoryId: 'verduleria',
      note: 'Fresh Greens & Vegetables',
      loggedBy: 'mati',
      paymentMethod: 'transferencia',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-5',
      date: `${currentMonth}-09`,
      amount: 28500,
      categoryId: 'carniceria',
      note: 'Steaks & Chicken Cuts',
      loggedBy: 'mati',
      paymentMethod: 'debito',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-6',
      date: `${currentMonth}-11`,
      amount: 9200,
      categoryId: 'huevos',
      note: 'Farm eggs 2x packs',
      loggedBy: 'belu',
      paymentMethod: 'efectivo',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-7',
      date: `${currentMonth}-12`,
      amount: 42000,
      categoryId: 'combustible',
      note: 'Full Tank Gas',
      loggedBy: 'mati',
      paymentMethod: 'debito',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-8',
      date: `${currentMonth}-13`,
      amount: 32000,
      categoryId: 'subscripciones',
      note: 'Fiber Internet & Services',
      loggedBy: 'mati',
      paymentMethod: 'debito',
      isRecurring: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-9',
      date: `${currentMonth}-14`,
      amount: 36000,
      categoryId: 'salidas',
      note: 'Sushi & Drinks Dinner',
      loggedBy: 'belu',
      paymentMethod: 'credito',
      createdAt: new Date().toISOString(),
    },
  ];
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUser, setActiveUserState] = useState<UserId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    return (saved as UserId) || 'mati';
  });

  const [userFilter, setUserFilterState] = useState<UserFilter>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_FILTER);
    return (saved as UserFilter) || 'all';
  });

  const [activeTab, setActiveTabState] = useState<AppTab>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    if (saved === 'cockpit' || saved === 'force_gym' || saved === 'analytics') {
      return saved as AppTab;
    }
    return 'cockpit';
  });

  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonthKey());

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INCOMES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return getSeedIncomes();
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return getSeedExpenses();
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return DEFAULT_CATEGORIES;
  });

  const [recurringCommitments, setRecurringCommitments] = useState<RecurringCommitment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    const currentMonth = getCurrentMonthKey();
    return DEFAULT_RECURRING.map(rec => ({
      ...rec,
      paidMonths: { [currentMonth]: true },
    }));
  });

  const [supplements, setSupplements] = useState<SupplementProduct[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLEMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return DEFAULT_SUPPLEMENTS;
  });

  const [liveEvents, setLiveEvents] = useState<LiveSyncEvent[]>([]);
  const [activeIslandEvent, setActiveIslandEvent] = useState<LiveSyncEvent | null>(null);

  const bankConnections: Record<PaymentPlatform, BankConnectionState> = {
    mercadopago: { connected: true, name: 'Mercado Pago', lastSync: 'Live', count: 18 },
    galicia: { connected: true, name: 'Banco Galicia', lastSync: 'Live', count: 4 },
    cuenta_dni: { connected: true, name: 'Cuenta DNI', lastSync: 'Live', count: 8 },
    lemon: { connected: true, name: 'Lemon Cash', lastSync: 'Live', count: 6 },
    efectivo: { connected: true, name: 'Cash', lastSync: 'Manual', count: 0 },
    otro: { connected: true, name: 'Other', lastSync: 'Manual', count: 0 },
  };

  // Persistence & Sync
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes)); }, [incomes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringCommitments)); }, [recurringCommitments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUPPLEMENTS, JSON.stringify(supplements)); }, [supplements]);

  const pendingSyncs = React.useRef(0);

  // Live Sync Engine
  const performSync = useCallback(async () => {
    if (!autoSyncEnabled || pendingSyncs.current > 0) return;
    const data = await FinanceAPI.fetchAll();
    if (data && pendingSyncs.current === 0) {
      if (data.expenses.length > 0) setExpenses(data.expenses);
      if (data.incomes.length > 0) setIncomes(data.incomes);
      
      // Merge recurring statuses
      setRecurringCommitments(prev => {
        return prev.map(rec => {
          const paidKeys = data.recurringLog
            .filter(log => log.recurringId === rec.id)
            .map(log => log.monthKey);
            
          const newPaidMonths: Record<string, boolean> = {};
          paidKeys.forEach(k => { newPaidMonths[k] = true; });
          
          return { ...rec, paidMonths: newPaidMonths };
        });
      });
    }
  }, [autoSyncEnabled]);

  // Initial load and periodic polling
  useEffect(() => {
    performSync();
    const interval = setInterval(performSync, 15000); // 15s poll
    return () => clearInterval(interval);
  }, [performSync]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, activeUser); }, [activeUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USER_FILTER, userFilter); }, [userFilter]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, JSON.stringify(autoSyncEnabled)); }, [autoSyncEnabled]);

  const setActiveUser = (user: UserId) => setActiveUserState(user);
  const setUserFilter = (filter: UserFilter) => {
    setUserFilterState(filter);
    if ('vibrate' in navigator) navigator.vibrate(8);
  };
  const setActiveTab = (tab: AppTab) => {
    setActiveTabState(tab);
    if ('vibrate' in navigator) navigator.vibrate(8);
  };

  const toggleAutoSync = () => {
    setAutoSyncEnabled(prev => !prev);
    if ('vibrate' in navigator) navigator.vibrate(15);
  };

  const showIslandBanner = useCallback((event: LiveSyncEvent) => {
    setActiveIslandEvent(event);
    setLiveEvents(prev => [event, ...prev.slice(0, 19)]);
  }, []);

  const dismissIslandEvent = () => setActiveIslandEvent(null);

  const triggerLiveSyncNotification = (eventData: Omit<LiveSyncEvent, 'id' | 'timestamp'>) => {
    const event: LiveSyncEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    showIslandBanner(event);
  };

  // CRUD for Expenses
  const addExpense = (newExpenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    setExpenses(prev => [newExpense, ...prev]);

    const cat = categories.find(c => c.id === newExpense.categoryId);
    const categoryName = cat ? cat.name : 'Expense';

    triggerLiveSyncNotification({
      type: 'expense_added',
      title: `Logged by ${newExpense.loggedBy === 'mati' ? 'Mati' : 'Belu'}`,
      subtitle: `${categoryName} · ${formatARS(newExpense.amount)}`,
      amount: newExpense.amount,
      actor: newExpense.loggedBy,
    });

    // Optimistic background sync
    pendingSyncs.current++;
    FinanceAPI.addExpense(newExpense).finally(() => { pendingSyncs.current--; });

    return newExpense;
  };

  const updateExpense = (id: string, updatedData: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updatedData } : e))
    );
    triggerLiveSyncNotification({
      type: 'expense_updated',
      title: 'Expense Updated',
      subtitle: `${formatARS(updatedData.amount || 0)} modified`,
      amount: updatedData.amount || 0,
      actor: activeUser,
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    pendingSyncs.current++;
    FinanceAPI.deleteExpense(id).finally(() => { pendingSyncs.current--; });
  };

  // CRUD for Incomes
  const addIncome = (newIncomeData: Omit<Income, 'id' | 'createdAt'>): Income => {
    const newIncome: Income = {
      ...newIncomeData,
      id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    setIncomes(prev => [newIncome, ...prev]);

    const subtitle = newIncome.forceDetails?.type === 'cuota'
      ? `Due from ${newIncome.forceDetails.memberName || 'Member'} · ${formatARS(newIncome.amount)}`
      : `Supplement (${newIncome.forceDetails?.productTag || 'Sale'}) · ${formatARS(newIncome.amount)}`;

    triggerLiveSyncNotification({
      type: 'income_added',
      title: 'Force Gym Inflow Logged',
      subtitle,
      amount: newIncome.amount,
      actor: 'mati',
    });

    pendingSyncs.current++;
    FinanceAPI.addIncome(newIncome).finally(() => { pendingSyncs.current--; });

    return newIncome;
  };

  const updateIncome = (id: string, updatedData: Partial<Omit<Income, 'id' | 'createdAt'>>) => {
    setIncomes(prev =>
      prev.map(i => (i.id === id ? { ...i, ...updatedData } : i))
    );
  };

  const deleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
    pendingSyncs.current++;
    FinanceAPI.deleteIncome(id).finally(() => { pendingSyncs.current--; });
  };

  // CRUD for Categories
  const addCategory = (categoryData: Omit<ExpenseCategory, 'id'>): ExpenseCategory => {
    const newCat: ExpenseCategory = {
      ...categoryData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isCustom: true,
    };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updatedData: Partial<Omit<ExpenseCategory, 'id'>>) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updatedData } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const toggleRecurringPaid = (recurringId: string, monthKey: string = selectedMonth) => {
    setRecurringCommitments(prev =>
      prev.map(rec => {
        if (rec.id === recurringId) {
          const currentStatus = !!rec.paidMonths[monthKey];
          const newStatus = !currentStatus;
          
          if (newStatus) {
            triggerLiveSyncNotification({
              type: 'recurring_paid',
              title: `${rec.name} Paid`,
              subtitle: `${formatMonthName(monthKey)} · ${formatARS(rec.defaultAmount)}`,
              amount: rec.defaultAmount,
              actor: activeUser,
            });
          }

          pendingSyncs.current++;
          FinanceAPI.toggleRecurring(recurringId, monthKey).finally(() => { pendingSyncs.current--; });

          return {
            ...rec,
            paidMonths: {
              ...rec.paidMonths,
              [monthKey]: newStatus,
            },
          };
        }
        return rec;
      })
    );
  };

  const addSupplementProduct = (supplementData: Omit<SupplementProduct, 'id'>): SupplementProduct => {
    const newSup: SupplementProduct = {
      ...supplementData,
      id: `sup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setSupplements(prev => [...prev, newSup]);
    return newSup;
  };

  const simulateInboundBankTransfer = (platform: PaymentPlatform = 'mercadopago') => {
    const sampleMembers = ['Mariano Benitez', 'Sofia Romero', 'Valeria Paz', 'Joaquin Silva', 'Esteban Gomez'];
    const randomMember = sampleMembers[Math.floor(Math.random() * sampleMembers.length)];
    const isCuota = Math.random() > 0.3;
    const amount = isCuota ? 45000 : 29000;
    const today = new Date().toISOString().split('T')[0];

    addIncome({
      amount,
      source: 'force_gym',
      platform,
      forceDetails: {
        type: isCuota ? 'cuota' : 'suplemento',
        memberName: randomMember,
        productTag: isCuota ? undefined : 'Creatine Monohydrate',
      },
      notes: `Automated Bank Transfer Detected (${platform.toUpperCase()})`,
      date: today,
      createdBy: 'mati',
    });
  };

  const resetToSampleData = () => {
    setIncomes(getSeedIncomes());
    setExpenses(getSeedExpenses());
    setCategories(DEFAULT_CATEGORIES);
    setRecurringCommitments(DEFAULT_RECURRING);
    setSupplements(DEFAULT_SUPPLEMENTS);
  };

  const allMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(getCurrentMonthKey());
    incomes.forEach(i => set.add(i.date.substring(0, 7)));
    expenses.forEach(e => set.add(e.date.substring(0, 7)));
    return Array.from(set).sort().reverse();
  }, [incomes, expenses]);

  const monthlySummary = useMemo<MonthlySummary>(() => {
    const filteredIncomes = incomes.filter(i => i.date.startsWith(selectedMonth));
    const filteredExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

    let totalIncome = 0;
    let assurantTotal = 0;
    let forceGymTotal = 0;
    let forceCuotasCount = 0;
    let forceCuotasTotal = 0;
    let forceSuplementosTotal = 0;

    for (const inc of filteredIncomes) {
      totalIncome += inc.amount;
      if (inc.source === 'assurant') {
        assurantTotal += inc.amount;
      } else {
        forceGymTotal += inc.amount;
        if (inc.forceDetails?.type === 'cuota') {
          forceCuotasCount += 1;
          forceCuotasTotal += inc.amount;
        } else {
          forceSuplementosTotal += inc.amount;
        }
      }
    }

    let totalExpenses = 0;
    const byCategory: Record<string, number> = {};
    const byLogger = { mati: 0, belu: 0 };

    for (const exp of filteredExpenses) {
      totalExpenses += exp.amount;
      byCategory[exp.categoryId] = (byCategory[exp.categoryId] || 0) + exp.amount;
      if (exp.loggedBy === 'mati') {
        byLogger.mati += exp.amount;
      } else {
        byLogger.belu += exp.amount;
      }
    }

    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
    const currentDay = isCurrentMonth ? today.getDate() : totalDaysInMonth;
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay);

    const netAvailableCash = totalIncome - totalExpenses;
    const dailySafeBurnRate = netAvailableCash > 0 ? Math.round(netAvailableCash / daysRemaining) : 0;

    return {
      monthKey: selectedMonth,
      monthName: formatMonthName(selectedMonth),
      totalIncome,
      totalExpenses,
      netAvailableCash,
      assurantTotal,
      forceGymTotal,
      forceCuotasCount,
      forceCuotasTotal,
      forceSuplementosTotal,
      byCategory,
      byLogger,
      daysRemaining,
      dailySafeBurnRate,
    };
  }, [incomes, expenses, selectedMonth]);

  return (
    <FinanceContext.Provider
      value={{
        activeUser,
        setActiveUser,
        userFilter,
        setUserFilter,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        incomes,
        expenses,
        categories,
        recurringCommitments,
        supplements,
        liveEvents,
        activeIslandEvent,
        dismissIslandEvent,
        autoSyncEnabled,
        toggleAutoSync,
        bankConnections,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleRecurringPaid,
        addSupplementProduct,
        simulateInboundBankTransfer,
        monthlySummary,
        allMonths,
        triggerLiveSyncNotification,
        resetToSampleData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};

