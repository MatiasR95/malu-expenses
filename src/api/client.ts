import { Expense, Income, RecurringCommitment } from '../types/finance';

// When you deploy the Google Apps Script Web App, replace this URL.
// Ensure it ends with /exec
let API_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';

export const setApiUrl = (url: string) => {
  API_URL = url;
  localStorage.setItem('couple_finance_api_url', url);
};

// Fallback to localStorage if the env var wasn't set but user set it manually
if (!API_URL) {
  API_URL = localStorage.getItem('couple_finance_api_url') || '';
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
        return json.data as FetchDataResponse;
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
