export interface Bank {
  id: number;
  name: string;
  color: string;
}

export interface BankCreate {
  name: string;
  color: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  expense_type: 'fixed' | 'variable';
  category_id: number;
  date: string;
  category: ExpenseCategory;
}

export interface ExpenseCreate {
  description: string;
  amount: number;
  expense_type: 'fixed' | 'variable';
  category_id: number;
  date: string;
}

export interface BalanceRecord {
  id: number;
  bank_id: number;
  date: string;
  account_balance: number;
  credit_card_current: number;
  credit_card_month_1: number;
  credit_card_month_2: number;
  credit_card_month_3: number;
  credit_card_month_4: number;
  credit_card_month_5: number;
  credit_card_month_6: number;
  investments: number;
  bank: Bank;
}

export interface BalanceRecordCreate {
  bank_id: number;
  date: string;
  account_balance: number;
  credit_card_current: number;
  credit_card_month_1: number;
  credit_card_month_2: number;
  credit_card_month_3: number;
  credit_card_month_4: number;
  credit_card_month_5: number;
  credit_card_month_6: number;
  investments: number;
}
