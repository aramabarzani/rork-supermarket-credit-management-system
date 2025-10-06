export interface Installment {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  paidBy?: string;
  paidByName?: string;
  installmentNumber: number;
  totalInstallments: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface InstallmentPlan {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  numberOfInstallments: number;
  installmentAmount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  installments: Installment[];
  createdAt: string;
  createdBy: string;
  createdByName: string;
  notes?: string;
}

export interface InstallmentReminder {
  id: string;
  installmentId: string;
  customerId: string;
  customerName: string;
  reminderDate: string;
  reminderTime: string;
  message: string;
  type: 'sms' | 'whatsapp' | 'push' | 'email';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
}

export interface InstallmentReport {
  totalInstallments: number;
  paidInstallments: number;
  pendingInstallments: number;
  overdueInstallments: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  collectionRate: number;
  onTimePaymentRate: number;
}
