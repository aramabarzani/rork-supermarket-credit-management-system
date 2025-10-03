export interface CommissionRule {
  id: string;
  name: string;
  nameKurdish: string;
  description?: string;
  descriptionKurdish?: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  tiers?: CommissionTier[];
  appliesTo: 'all' | 'debt' | 'payment' | 'product' | 'category';
  targetId?: string;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionTier {
  minAmount: number;
  maxAmount?: number;
  rate: number;
}

export interface EmployeeCommission {
  id: string;
  employeeId: string;
  employeeName: string;
  ruleId: string;
  ruleName: string;
  ruleNameKurdish: string;
  amount: number;
  baseAmount: number;
  rate: number;
  type: 'debt' | 'payment' | 'sale';
  relatedDebtId?: string;
  relatedPaymentId?: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  notes?: string;
  notesKurdish?: string;
  calculatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  paidAt?: string;
  paidBy?: string;
  createdAt: string;
}

export interface CommissionPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  commissionIds: string[];
  totalAmount: number;
  paidAmount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'check';
  paymentDate: string;
  notes?: string;
  notesKurdish?: string;
  paidBy: string;
  paidByName: string;
  createdAt: string;
}

export interface CommissionReport {
  employeeId: string;
  employeeName: string;
  period: string;
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  commissionCount: number;
  breakdown: {
    type: string;
    count: number;
    amount: number;
  }[];
}
