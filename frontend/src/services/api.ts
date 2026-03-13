import axios from 'axios';
import type {
  Bank,
  BankCreate,
  ExpenseCategory,
  Expense,
  ExpenseCreate,
  BalanceRecord,
  BalanceRecordCreate,
} from '@/types';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const api = {
  // Banks
  getBanks: async (): Promise<Bank[]> => {
    const { data } = await httpClient.get<Bank[]>('/api/banks/');
    return data;
  },
  createBank: async (payload: BankCreate): Promise<Bank> => {
    const { data } = await httpClient.post<Bank>('/api/banks/', payload);
    return data;
  },
  deleteBank: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/banks/${id}`);
  },

  // Expense Categories
  getCategories: async (): Promise<ExpenseCategory[]> => {
    const { data } = await httpClient.get<ExpenseCategory[]>('/api/expenses/categories');
    return data;
  },
  createCategory: async (name: string): Promise<ExpenseCategory> => {
    const { data } = await httpClient.post<ExpenseCategory>('/api/expenses/categories', { name });
    return data;
  },
  deleteCategory: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/expenses/categories/${id}`);
  },

  // Expenses
  getExpenses: async (expenseType?: string): Promise<Expense[]> => {
    const params = expenseType ? { expense_type: expenseType } : {};
    const { data } = await httpClient.get<Expense[]>('/api/expenses/', { params });
    return data;
  },
  createExpense: async (payload: ExpenseCreate): Promise<Expense> => {
    const { data } = await httpClient.post<Expense>('/api/expenses/', payload);
    return data;
  },
  deleteExpense: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/expenses/${id}`);
  },

  // Balance Records
  getBalanceRecords: async (bankId?: number): Promise<BalanceRecord[]> => {
    const params = bankId ? { bank_id: bankId } : {};
    const { data } = await httpClient.get<BalanceRecord[]>('/api/balance-records/', { params });
    return data;
  },
  createBalanceRecord: async (payload: BalanceRecordCreate): Promise<BalanceRecord> => {
    const { data } = await httpClient.post<BalanceRecord>('/api/balance-records/', payload);
    return data;
  },
  deleteBalanceRecord: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/balance-records/${id}`);
  },
};
