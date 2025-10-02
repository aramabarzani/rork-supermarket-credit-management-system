export type BlacklistReason = 
  | 'repeated_late_payment'
  | 'fraud'
  | 'excessive_debt'
  | 'bounced_check'
  | 'legal_issue'
  | 'other';

export type BlacklistStatus = 'active' | 'removed' | 'under_review';

export interface BlacklistEntry {
  id: string;
  customerId: string;
  customerName: string;
  reason: BlacklistReason;
  reasonDetails: string;
  addedBy: string;
  addedAt: string;
  status: BlacklistStatus;
  removedBy?: string;
  removedAt?: string;
  removalReason?: string;
  totalDebt: number;
  overduePayments: number;
  notes: string;
  attachments?: string[];
}

export interface BlacklistAlert {
  id: string;
  customerId: string;
  customerName: string;
  alertType: 'warning' | 'critical';
  message: string;
  createdAt: string;
}

export interface BlacklistStats {
  totalBlacklisted: number;
  activeBlacklisted: number;
  removedThisMonth: number;
  underReview: number;
  totalDebtFromBlacklisted: number;
  reasonBreakdown: Record<BlacklistReason, number>;
}
