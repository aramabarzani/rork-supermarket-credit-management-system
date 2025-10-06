export interface Settlement {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  originalAmount: number;
  settledAmount: number;
  discountAmount: number;
  discountPercentage: number;
  reason: string;
  terms: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'installments';
  installmentPlan?: {
    numberOfInstallments: number;
    installmentAmount: number;
    frequency: 'weekly' | 'monthly';
    startDate: string;
  };
  status: 'proposed' | 'accepted' | 'rejected' | 'completed';
  proposedAt: string;
  proposedBy: string;
  proposedByName: string;
  acceptedAt?: string;
  acceptedBy?: string;
  acceptedByName?: string;
  completedAt?: string;
  documents?: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  notes?: string;
}

export interface SettlementReport {
  totalSettlements: number;
  totalOriginalAmount: number;
  totalSettledAmount: number;
  totalDiscountAmount: number;
  averageDiscountPercentage: number;
  settlementsByStatus: {
    status: string;
    count: number;
    amount: number;
  }[];
  topSettlements: {
    customerId: string;
    customerName: string;
    originalAmount: number;
    settledAmount: number;
    discountPercentage: number;
  }[];
}
