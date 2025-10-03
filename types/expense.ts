export interface Expense {
  id: string;
  category: string;
  categoryKurdish: string;
  subcategory?: string;
  subcategoryKurdish?: string;
  amount: number;
  currency: string;
  description: string;
  descriptionKurdish: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card';
  vendor?: string;
  vendorKurdish?: string;
  receiptNumber?: string;
  receiptImage?: string;
  date: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: string;
  tags?: string[];
  notes?: string;
  notesKurdish?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  nameKurdish: string;
  description?: string;
  descriptionKurdish?: string;
  parentId?: string;
  budget?: number;
  budgetPeriod?: 'monthly' | 'quarterly' | 'yearly';
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseBudget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryNameKurdish: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  spent: number;
  remaining: number;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseReport {
  period: string;
  totalExpenses: number;
  categoryBreakdown: {
    category: string;
    categoryKurdish: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
  paymentMethodBreakdown: {
    method: string;
    amount: number;
    percentage: number;
  }[];
  topVendors: {
    vendor: string;
    vendorKurdish: string;
    amount: number;
    count: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}

export const EXPENSE_CATEGORIES = [
  { id: 'rent', name: 'Rent', nameKurdish: 'کرێ' },
  { id: 'utilities', name: 'Utilities', nameKurdish: 'خزمەتگوزاریەکان' },
  { id: 'salaries', name: 'Salaries', nameKurdish: 'مووچە' },
  { id: 'supplies', name: 'Supplies', nameKurdish: 'پێداویستیەکان' },
  { id: 'marketing', name: 'Marketing', nameKurdish: 'بازرگانی' },
  { id: 'maintenance', name: 'Maintenance', nameKurdish: 'چاککردنەوە' },
  { id: 'transportation', name: 'Transportation', nameKurdish: 'گواستنەوە' },
  { id: 'insurance', name: 'Insurance', nameKurdish: 'بیمە' },
  { id: 'taxes', name: 'Taxes', nameKurdish: 'باج' },
  { id: 'other', name: 'Other', nameKurdish: 'هیتر' },
] as const;
