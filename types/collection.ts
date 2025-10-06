export interface CollectionAttempt {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  attemptDate: string;
  attemptTime: string;
  method: 'phone' | 'sms' | 'whatsapp' | 'email' | 'visit' | 'letter';
  status: 'successful' | 'unsuccessful' | 'promised' | 'refused' | 'no_contact';
  contactedPerson?: string;
  promisedPaymentDate?: string;
  promisedAmount?: number;
  notes?: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface CollectionStrategy {
  id: string;
  name: string;
  description: string;
  stages: {
    stageNumber: number;
    name: string;
    daysAfterDue: number;
    actions: {
      type: 'phone' | 'sms' | 'whatsapp' | 'email' | 'visit' | 'letter' | 'legal';
      message?: string;
      frequency: number;
    }[];
  }[];
  isActive: boolean;
  applicableToCustomerTypes?: ('vip' | 'regular' | 'new')[];
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface CollectionReport {
  totalAttempts: number;
  successfulAttempts: number;
  unsuccessfulAttempts: number;
  promisedPayments: number;
  refusedPayments: number;
  noContactAttempts: number;
  attemptsByMethod: {
    method: string;
    count: number;
    successRate: number;
  }[];
  collectionRate: number;
  averageAttemptsPerDebt: number;
  topCollectors: {
    collectorId: string;
    collectorName: string;
    totalAttempts: number;
    successfulAttempts: number;
    collectedAmount: number;
  }[];
}
