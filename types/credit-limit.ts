export interface CustomerCreditLimit {
  id: string;
  customerId: string;
  customerName: string;
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
  status: 'active' | 'suspended' | 'exceeded' | 'frozen';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  creditScore?: number;
  paymentHistory: {
    onTimePayments: number;
    latePayments: number;
    missedPayments: number;
    averagePaymentDays: number;
  };
  lastReviewDate?: string;
  nextReviewDate?: string;
  notes?: string;
  notesKurdish?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreditLimitRequest {
  id: string;
  customerId: string;
  customerName: string;
  currentLimit: number;
  requestedLimit: number;
  reason: string;
  reasonKurdish: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reviewNotesKurdish?: string;
}

export interface CreditLimitHistory {
  id: string;
  customerId: string;
  customerName: string;
  previousLimit: number;
  newLimit: number;
  changeReason: string;
  changeReasonKurdish: string;
  changedBy: string;
  changedByName: string;
  changedAt: string;
}

export interface CreditLimitAlert {
  id: string;
  customerId: string;
  customerName: string;
  alertType: 'approaching_limit' | 'limit_exceeded' | 'high_risk' | 'review_due';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  messageKurdish: string;
  threshold?: number;
  currentValue?: number;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export const CREDIT_RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', labelKurdish: 'مەترسی کەم', color: '#10b981' },
  { value: 'medium', label: 'Medium Risk', labelKurdish: 'مەترسی مامناوەند', color: '#f59e0b' },
  { value: 'high', label: 'High Risk', labelKurdish: 'مەترسی زۆر', color: '#ef4444' },
  { value: 'critical', label: 'Critical Risk', labelKurdish: 'مەترسی گەورە', color: '#dc2626' },
] as const;
