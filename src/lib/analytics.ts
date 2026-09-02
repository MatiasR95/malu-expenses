import { useMemo } from 'react';
import { Expense, ExpenseCategory, Income, UserFilter } from '../types/finance';
import { parseLocalDate } from '../utils/currency';

/**
 * Derived readings shared by every visual in the app.
 *
 * The screens used to each re-walk the ledger with slightly different rules --
 * the hero chart filtered by payer, the summary did not, and the analytics
 * screen filtered again a third way. Two figures on the same screen could
 * therefore disagree about the same month. Everything that reads the ledger
 * for a *picture* now comes through here, so the pace meter, the trace, the
 * heat grid and the category rings are all answering the same question.
 */

export interface DayPoint {
  /** Day of month, 1-based. */
  day: number;
  /** Cash in on this day. */
  income: number;
  /** Cash out on this day. */
  spend: number;
  /** Running balance at end of this day. */
  balance: number;
  /** True once the day is past (or is) today. */
  elapsed: boolean;
}

export interface MonthShape {
  year: number;
  month: number; // 1-12
  daysInMonth: number;
  /** Day number of "now" inside this month; daysInMonth for past months. */
  today: number;
  isCurrentMonth: boolean;
  /** How far through the month we are, 0-1. */
  progress: number;
}

export function getMonthShape(monthKey: string): MonthShape {
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const today = isCurrentMonth ? now.getDate() : daysInMonth;
  return {
    year,
    month,
    daysInMonth,
    today,
    isCurrentMonth,
    progress: Math.min(1, today / daysInMonth),
  };
}

const dayOf = (iso: string) => Number(iso.slice(8, 10));

interface LedgerInput {
  incomes: Income[];
  expenses: Expense[];
  selectedMonth: string;
  userFilter: UserFilter;
}

export interface MonthAnalytics {
  shape: MonthShape;
  /** One entry per day of the month, always full length. */
  days: DayPoint[];
  /** Days up to and including today — what actually happened. */
  elapsedDays: DayPoint[];
  /**
   * Days 1..`bookedThrough` — everything on the books, which can run past
   * today when rows are dated forward (rent debited ahead, a card batch
   * split across the month). This is the run the balance trace draws solid.
   */
  bookedDays: DayPoint[];
  /** Last day of the month that carries a row, never earlier than today. */
  bookedThrough: number;
  totalIncome: number;
  totalSpend: number;
  /** Spend that has actually happened, i.e. on or before today. */
  spendToDate: number;
  net: number;
  /** Average daily spend across elapsed days (forward-dated rows excluded). */
  avgDailySpend: number;
  /** What spend *would* be by now if the month burned evenly against income. */
  pacedBudget: number;
  /**
   * Spend divided by the even-pace budget. 1.0 = exactly on pace, >1 = ahead
   * of budget (burning too fast), <1 = under.
   */
  paceRatio: number;
  /** Projected end-of-month spend if the current rate holds. */
  projectedSpend: number;
  /** Projected end-of-month balance if the current rate holds. */
  projectedBalance: number;
  /** Days of runway left at the current average burn. Infinity if not spending. */
  runwayDays: number;
  /**
   * How much the forecast is worth. A daily rate inferred from two elapsed
   * days -- one of which happened to carry the rent -- projects the household
   * into bankruptcy by the 30th, and saying so without qualification is worse
   * than saying nothing. The UI prints this next to every projected figure.
   */
  forecastConfidence: 'low' | 'fair' | 'good';
  /** Largest single outflow this month. */
  biggestSpend: { amount: number; label: string } | null;
  /** Number of days this month with zero outflow. */
  noSpendDays: number;
  hasActivity: boolean;
}

/** Walk one month of the ledger into everything the visuals need. */
export function buildMonthAnalytics(
  { incomes, expenses, selectedMonth, userFilter }: LedgerInput,
  categories: ExpenseCategory[] = []
): MonthAnalytics {
  const shape = getMonthShape(selectedMonth);

  const monthIncomes = incomes.filter((i) => i.date.startsWith(selectedMonth));
  const monthExpenses = expenses
    .filter((e) => e.date.startsWith(selectedMonth))
    .filter((e) => userFilter === 'all' || e.loggedBy === userFilter);

  const days: DayPoint[] = [];
  let running = 0;
  for (let d = 1; d <= shape.daysInMonth; d++) {
    const income = monthIncomes
      .filter((i) => dayOf(i.date) === d)
      .reduce((s, i) => s + i.amount, 0);
    const spend = monthExpenses
      .filter((e) => dayOf(e.date) === d)
      .reduce((s, e) => s + e.amount, 0);
    running += income - spend;
    days.push({ day: d, income, spend, balance: running, elapsed: d <= shape.today });
  }

  const elapsedDays = days.filter((d) => d.elapsed);
  const totalIncome = monthIncomes.reduce((s, i) => s + i.amount, 0);
  const totalSpend = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const net = totalIncome - totalSpend;

  /* Rows dated later in the month are real -- rent posted ahead, a card batch
     split across upcoming dates -- but they are not evidence of a daily rate.
     Dividing the whole month's outflow by the two days that have elapsed is
     what produced a "projected close" of minus eight million on a month that
     is comfortably in the black. The rate comes from what has actually
     happened; what is already booked is added to the forecast whole. */
  const spendToDate = elapsedDays.reduce((s, d) => s + d.spend, 0);
  const avgDailySpend = elapsedDays.length > 0 ? spendToDate / elapsedDays.length : 0;

  const lastBooked = days.reduce(
    (acc, d) => (d.income > 0 || d.spend > 0 ? d.day : acc),
    shape.today
  );
  const bookedThrough = Math.max(shape.today, lastBooked);
  const bookedDays = days.slice(0, bookedThrough);

  const pacedBudget = totalIncome * shape.progress;
  const paceRatio = pacedBudget > 0 ? spendToDate / pacedBudget : 0;
  const projectedSpend = totalSpend + avgDailySpend * (shape.daysInMonth - bookedThrough);
  const projectedBalance = totalIncome - projectedSpend;
  const runwayDays = avgDailySpend > 0 ? net / avgDailySpend : Infinity;

  let biggestSpend: MonthAnalytics['biggestSpend'] = null;
  for (const e of monthExpenses) {
    if (!biggestSpend || e.amount > biggestSpend.amount) {
      biggestSpend = {
        amount: e.amount,
        label: e.note || categories.find((c) => c.id === e.categoryId)?.name || 'Expense',
      };
    }
  }

  return {
    shape,
    days,
    elapsedDays,
    bookedDays,
    bookedThrough,
    totalIncome,
    totalSpend,
    spendToDate,
    net,
    avgDailySpend,
    pacedBudget,
    paceRatio,
    projectedSpend,
    projectedBalance,
    runwayDays,
    forecastConfidence: elapsedDays.length < 5 ? 'low' : elapsedDays.length < 12 ? 'fair' : 'good',
    biggestSpend,
    noSpendDays: elapsedDays.filter((d) => d.spend === 0).length,
    hasActivity: monthIncomes.length > 0 || monthExpenses.length > 0,
  };
}

export function useMonthAnalytics(
  input: LedgerInput,
  categories: ExpenseCategory[] = []
): MonthAnalytics {
  const { incomes, expenses, selectedMonth, userFilter } = input;
  return useMemo(
    () => buildMonthAnalytics({ incomes, expenses, selectedMonth, userFilter }, categories),
    [incomes, expenses, selectedMonth, userFilter, categories]
  );
}

/* -------------------------------------------------------------------------
   Category rollup
------------------------------------------------------------------------- */

export interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  /** Share of the month's total outflow, 0-100. */
  share: number;
  budget?: number;
  /** Spend against budget, 0-1+ (undefined when no budget is set). */
  budgetUsed?: number;
  overBudget: boolean;
  count: number;
}

export function rollUpCategories(
  expenses: Expense[],
  categories: ExpenseCategory[],
  selectedMonth: string,
  userFilter: UserFilter
): CategoryRow[] {
  const scoped = expenses
    .filter((e) => e.date.startsWith(selectedMonth))
    .filter((e) => userFilter === 'all' || e.loggedBy === userFilter);

  const total = scoped.reduce((s, e) => s + e.amount, 0);
  const bucket = new Map<string, { amount: number; count: number }>();

  for (const e of scoped) {
    const prev = bucket.get(e.categoryId) ?? { amount: 0, count: 0 };
    bucket.set(e.categoryId, { amount: prev.amount + e.amount, count: prev.count + 1 });
  }

  return Array.from(bucket.entries())
    .map(([id, { amount, count }]) => {
      const cat = categories.find((c) => c.id === id);
      const budget = cat?.monthlyBudget;
      return {
        id,
        name: cat?.name ?? id,
        icon: cat?.icon ?? id,
        color: cat?.color ?? '#dcdecf',
        amount,
        share: total > 0 ? (amount / total) * 100 : 0,
        budget,
        budgetUsed: budget && budget > 0 ? amount / budget : undefined,
        overBudget: budget != null && budget > 0 && amount > budget,
        count,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

/* -------------------------------------------------------------------------
   Cross-month history
------------------------------------------------------------------------- */

export interface MonthBar {
  monthKey: string;
  /** Three-letter month label, e.g. "SEP". */
  label: string;
  income: number;
  spend: number;
  net: number;
}

/** Last `count` months (oldest first), whether or not they hold rows. */
export function buildMonthHistory(
  incomes: Income[],
  expenses: Expense[],
  selectedMonth: string,
  userFilter: UserFilter,
  count = 6
): MonthBar[] {
  const [y, m] = selectedMonth.split('-').map(Number);
  const bars: MonthBar[] = [];

  for (let back = count - 1; back >= 0; back--) {
    const d = new Date(y, m - 1 - back, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const income = incomes
      .filter((i) => i.date.startsWith(key))
      .reduce((s, i) => s + i.amount, 0);
    const spend = expenses
      .filter((e) => e.date.startsWith(key))
      .filter((e) => userFilter === 'all' || e.loggedBy === userFilter)
      .reduce((s, e) => s + e.amount, 0);
    bars.push({
      label: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      monthKey: key,
      income,
      spend,
      net: income - spend,
    });
  }
  return bars;
}

/* -------------------------------------------------------------------------
   Weekday rhythm
------------------------------------------------------------------------- */

export interface WeekdayCell {
  /** 0 = Monday … 6 = Sunday, so the grid reads like a calendar. */
  index: number;
  label: string;
  total: number;
  count: number;
  /** Share of the heaviest weekday, 0-1. */
  intensity: number;
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Which days of the week this household actually spends on. */
export function buildWeekdayRhythm(
  expenses: Expense[],
  selectedMonth: string,
  userFilter: UserFilter
): WeekdayCell[] {
  const cells: WeekdayCell[] = WEEKDAY_LABELS.map((label, index) => ({
    index,
    label,
    total: 0,
    count: 0,
    intensity: 0,
  }));

  for (const e of expenses) {
    if (!e.date.startsWith(selectedMonth)) continue;
    if (userFilter !== 'all' && e.loggedBy !== userFilter) continue;
    // getDay() is Sunday-first; shift so Monday leads.
    const idx = (parseLocalDate(e.date).getDay() + 6) % 7;
    cells[idx].total += e.amount;
    cells[idx].count += 1;
  }

  const peak = Math.max(...cells.map((c) => c.total), 0);
  return cells.map((c) => ({ ...c, intensity: peak > 0 ? c.total / peak : 0 }));
}
