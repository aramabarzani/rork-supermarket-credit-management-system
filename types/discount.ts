export interface Discount {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  amount: number;
  percentage?: number;
  reason: string;
  type: 'fixed' | 'percentage' | 'early_payment' | 'loyalty' | 'promotional';
  approvedBy: string;
  approvedByName: string;
  approvedAt: string;
  notes?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface DiscountRule {
  id: string;
  name: string;
  type: 'fixed' | 'percentage' | 'early_payment' | 'loyalty' | 'promotional';
  value: number;
  conditions: {
    minDebtAmount?: number;
    maxDebtAmount?: number;
    customerType?: 'vip' | 'regular' | 'new';
    paymentWithinDays?: number;
    minPurchaseCount?: number;
  };
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface DiscountReport {
  totalDiscounts: number;
  totalDiscountAmount: number;
  discountsByType: {
    type: string;
    count: number;
    amount: number;
  }[];
  topDiscountedCustomers: {
    customerId: string;
    customerName: string;
    totalDiscount: number;
    discountCount: number;
  }[];
}
