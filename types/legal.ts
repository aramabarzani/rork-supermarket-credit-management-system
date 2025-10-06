export interface LegalCase {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  caseNumber: string;
  caseType: 'collection' | 'dispute' | 'fraud' | 'bankruptcy';
  status: 'filed' | 'in_progress' | 'settled' | 'won' | 'lost' | 'dismissed';
  filedAt: string;
  filedBy: string;
  filedByName: string;
  court?: string;
  lawyer?: string;
  lawyerContact?: string;
  debtAmount: number;
  claimedAmount: number;
  settledAmount?: number;
  nextHearingDate?: string;
  documents?: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  notes?: string;
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
  outcome?: string;
}

export interface LegalAction {
  id: string;
  caseId: string;
  actionType: 'hearing' | 'filing' | 'settlement' | 'judgment' | 'appeal';
  actionDate: string;
  description: string;
  outcome?: string;
  nextSteps?: string;
  performedBy: string;
  performedByName: string;
  documents?: {
    name: string;
    url: string;
  }[];
  createdAt: string;
}

export interface LegalReport {
  totalCases: number;
  activeCases: number;
  settledCases: number;
  wonCases: number;
  lostCases: number;
  totalClaimedAmount: number;
  totalSettledAmount: number;
  totalRecoveredAmount: number;
  casesByType: {
    type: string;
    count: number;
    amount: number;
  }[];
  averageSettlementTime: number;
  successRate: number;
}
