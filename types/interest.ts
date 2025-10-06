export interface Interest {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  amount: number;
  rate: number;
  type: 'simple' | 'compound' | 'late_fee';
  calculatedAt: string;
  appliedAt?: string;
  status: 'pending' | 'applied' | 'waived';
  reason: string;
  createdBy: string;
  createdByName: string;
  notes?: string;
}

export interface InterestRule {
  id: string;
  name: string;
  type: 'simple' | 'compound' | 'late_fee';
  rate: number;
  gracePeriodDays: number;
  calculationFrequency: 'daily' | 'weekly' | 'monthly';
  maxInterestAmount?: number;
  isActive: boolean;
  applicableToCustomerTypes?: ('vip' | 'regular' | 'new')[];
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface InterestReport {
  totalInterest: number;
  totalInterestApplied: number;
  totalInterestWaived: number;
  interestByType: {
    type: string;
    count: number;
    amount: number;
  }[];
  topInterestCustomers: {
    customerId: string;
    customerName: string;
    totalInterest: number;
    interestCount: number;
  }[];
}
