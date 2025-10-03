export interface InstallmentPlan {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  downPayment: number;
  remainingAmount: number;
  numberOfInstallments: number;
  installmentAmount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'defaulted';
  installments: Installment[];
  interestRate?: number;
  totalInterest?: number;
  lateFeeAmount?: number;
  notes?: string;
  notesKurdish?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Installment {
  id: string;
  planId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
  paidDate?: string;
  lateFee?: number;
  paymentId?: string;
  notes?: string;
  notesKurdish?: string;
}

export interface InstallmentPayment {
  id: string;
  planId: string;
  installmentId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card';
  paymentDate: string;
  receiptNumber?: string;
  notes?: string;
  notesKurdish?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface InstallmentSchedule {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  balance: number;
}

export const INSTALLMENT_FREQUENCIES = [
  { value: 'daily', label: 'Daily', labelKurdish: 'ڕۆژانە' },
  { value: 'weekly', label: 'Weekly', labelKurdish: 'هەفتانە' },
  { value: 'biweekly', label: 'Bi-weekly', labelKurdish: 'هەر دوو هەفتە جارێک' },
  { value: 'monthly', label: 'Monthly', labelKurdish: 'مانگانە' },
] as const;
