export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  group: string; // گروپی کڕیار
  rating: number; // پلەبەندی کڕیار (1-5)
  totalDebt: number;
  totalPaid: number;
  lastPaymentDate?: string;
  lastDebtDate?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  status: 'active' | 'inactive';
  notes?: string;
}

export interface CustomerAnalytics {
  inactiveCustomers: Customer[];
  newCustomersThisMonth: Customer[];
  highDebtCustomersThisMonth: Customer[];
  bestPayingCustomersThisMonth: Customer[];
  highestDebtCustomersYearly: Customer[];
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newThisMonth: number;
  totalDebtAmount: number;
  totalPaidAmount: number;
  averageDebtPerCustomer: number;
}

export interface MonthlyCustomerReport {
  customerId: string;
  customerName: string;
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
  transactionCount: number;
  lastActivity: string;
}

export interface YearlyCustomerReport {
  customerId: string;
  customerName: string;
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
  monthlyBreakdown: {
    month: string;
    debt: number;
    paid: number;
  }[];
}