import { Expense, Income } from '../types/finance';

// When you deploy the Google Apps Script Web App, replace this URL.
// Ensure it ends with /exec
const PROD_URL = 'https://script.google.com/macros/s/AKfycbw2nxuGRLptgSn_pOzsLht5Cy_IsGl1nLiMqcyvxK9HiZyk82Cl09LqpBhf4prZDW4ZDA/exec';
let API_URL = import.meta.env.VITE_APPS_SCRIPT_URL || PROD_URL;

export const setApiUrl = (url: string) => {
  API_URL = url;
  localStorage.setItem('couple_finance_api_url', url);
};

// Fallback to localStorage if the env var wasn't set but user set it manually
if (!API_URL) {
  API_URL = localStorage.getItem('couple_finance_api_url') || '';
}

const TAB_MONTHS: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

/**
 * Undo day/month swaps on rows imported from the gym sheet.
 *
 * That sheet parses dates month-first, so a day-first "10/08" (10 August)
 * comes through as 8 October: an August payment dated 2026-10-08. It leaked into October and made a brand-new month look like it
 * already had income. The tab the row came from ("Agosto 2026") says which
 * month it belongs to; when the stored date is off-month but swapping day and
 * month lands on it, the swap is the typo.
 */
export function fixImportedDate(income: Income): Income {
  const m = /^gym-import-([a-z]+)(\d{4})-/i.exec(income.id);
  const tabMonth = m && TAB_MONTHS[m[1].toLowerCase()];
  if (!tabMonth) return income;

  const [y, mo, d] = income.date.slice(0, 10).split('-').map(Number);
  if (mo === tabMonth || d !== tabMonth) return income;
  const date = `${y}-${String(d).padStart(2, '0')}-${String(mo).padStart(2, '0')}`;
  return { ...income, date };
}

interface FetchDataResponse {
  expenses: Expense[];
  incomes: Income[];
  recurringLog: { id: string; recurringId: string; monthKey: string; createdAt: string }[];
}

export const FinanceAPI = {
  isConfigured: () => !!API_URL,

  fetchAll: async (): Promise<FetchDataResponse | null> => {
    if (!API_URL) return null;
    try {
      // JSONP or GET depending on CORS. Google Apps Script usually supports GET with CORS 
      // if we follow redirects, but it's simpler to just fetch
      const res = await fetch(API_URL);
      const json = await res.json();
      if (json.status === 'success') {
        const data = json.data as FetchDataResponse;
        return { ...data, incomes: data.incomes.map(fixImportedDate) };
      }
      console.error('API Error:', json.message);
      return null;
    } catch (err) {
      console.error('Failed to fetch from API:', err);
      return null;
    }
  },

  addExpense: async (expense: Expense) => {
    return postAction('add_expense', expense);
  },

  deleteExpense: async (id: string) => {
    return postAction('delete_expense', { id });
  },

  addIncome: async (income: Income) => {
    return postAction('add_income', income);
  },

  deleteIncome: async (id: string) => {
    return postAction('delete_income', { id });
  },

  toggleRecurring: async (recurringId: string, monthKey: string) => {
    return postAction('toggle_recurring', { recurringId, monthKey });
  },
};

async function postAction(action: string, data: any) {
  if (!API_URL) return false;
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action, data }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Bypass preflight
      }
    });
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    console.error(`Failed to execute ${action}:`, err);
    return false;
  }
}
