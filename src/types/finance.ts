export type UserId = 'mati' | 'belu';
export type UserFilter = 'all' | 'mati' | 'belu';

export interface UserProfile {
  id: UserId;
  name: string;
  avatar: string;
  color: string;
  badge: string;
}

export type PaymentPlatform =
  | 'mercadopago'
  | 'galicia'
  | 'cuenta_dni'
  | 'lemon'
  | 'efectivo'
  | 'otro';

export type IncomeSource = 'force_gym' | 'assurant';

export type ForceIncomeType = 'cuota' | 'suplemento';

export interface ForceDetails {
  type: ForceIncomeType;
  memberName?: string;
  productTag?: string;
  quantity?: number;
  notes?: string;
}

export interface Income {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  amount: number;
  source: IncomeSource;
  platform: PaymentPlatform;
  forceDetails?: ForceDetails;
  notes?: string;
  createdBy: 'mati';
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  pastelBg?: string;
  isCustom?: boolean;
  monthlyBudget?: number;
}

export type PaymentMethod = 'debito' | 'credito' | 'transferencia' | 'efectivo';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  categoryId: string;
  note?: string;
  loggedBy: UserId;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  recurringCommitmentId?: string;
  createdAt: string;
}

export interface RecurringCommitment {
  id: string;
  name: string;
  type: 'expense' | 'income';
  categoryId?: string;
  source?: IncomeSource;
  defaultAmount: number;
  dueDay: number; // 1-31 (e.g. 7th for Fer Giveback, 10th for Alquiler)
  icon: string;
  platform?: PaymentPlatform;
  paidMonths: Record<string, boolean>; // e.g. { "2026-08": true }
}

export interface SupplementProduct {
  id: string;
  name: string;
  category: 'barras' | 'proteinas' | 'creatinas' | 'pre_entreno' | 'otros';
  defaultPrice: number;
  icon: string;
}

export interface LiveSyncEvent {
  id: string;
  type: 'income_added' | 'expense_added' | 'expense_deleted' | 'expense_updated' | 'recurring_paid' | 'transfer_parsed' | 'bank_sync';
  title: string;
  subtitle: string;
  amount: number;
  actor: UserId | 'system';
  timestamp: number;
}

export interface MonthlySummary {
  monthKey: string; // "YYYY-MM"
  monthName: string; // "Agosto 2026"
  totalIncome: number;
  totalExpenses: number;
  netAvailableCash: number;
  assurantTotal: number;
  forceGymTotal: number;
  forceCuotasCount: number;
  forceCuotasTotal: number;
  forceSuplementosTotal: number;
  byCategory: Record<string, number>;
  byLogger: {
    mati: number;
    belu: number;
  };
  daysRemaining: number;
  dailySafeBurnRate: number;
}

export type AppTab = 'cockpit' | 'force_gym' | 'analytics';

