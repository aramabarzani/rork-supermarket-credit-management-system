export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type CustomerRating = 'VIP' | 'Normal';

export type EmployeeLevel = 'senior' | 'mid' | 'junior';

export interface DebtEvaluation {
  totalDebt: number;
  averageDebt: number;
  maxDebt: number;
  minDebt: number;
  debtCount: number;
  period: TimeRange;
  startDate: string;
  endDate: string;
}

export interface PaymentEvaluation {
  totalPayment: number;
  averagePayment: number;
  maxPayment: number;
  minPayment: number;
  paymentCount: number;
  period: TimeRange;
  startDate: string;
  endDate: string;
}

export interface CustomerEvaluation {
  customerId: string;
  customerName: string;
  totalDebt: number;
  totalPayment: number;
  remainingDebt: number;
  paymentRate: number;
  rating: CustomerRating;
  lastActivityDate: string;
}

export interface EmployeeEvaluation {
  employeeId: string;
  employeeName: string;
  totalDebtsCreated: number;
  totalPaymentsProcessed: number;
  totalAmountHandled: number;
  activityCount: number;
  level: EmployeeLevel;
  lastActivityDate: string;
}

export interface SystemStatistics {
  totalCustomers: number;
  totalEmployees: number;
  totalDebts: number;
  totalPayments: number;
  totalDebtAmount: number;
  totalPaymentAmount: number;
  remainingDebtAmount: number;
  vipCustomers: number;
  normalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
}

export interface DebtTrendData {
  date: string;
  amount: number;
  count: number;
}

export interface PaymentTrendData {
  date: string;
  amount: number;
  count: number;
}

export interface CustomerStatsByRating {
  rating: CustomerRating;
  count: number;
  totalDebt: number;
  totalPayment: number;
  averageDebt: number;
}

export interface EmployeeStatsByLevel {
  level: EmployeeLevel;
  count: number;
  totalDebtsCreated: number;
  totalPaymentsProcessed: number;
  averagePerformance: number;
}

export interface LocationStats {
  city: string;
  location?: string;
  totalDebt: number;
  totalPayment: number;
  customerCount: number;
}

export interface ComparisonData {
  period: string;
  debt: number;
  payment: number;
  difference: number;
}

export interface SystemUsageStats {
  date: string;
  totalLogins: number;
  activeUsers: number;
  debtsCreated: number;
  paymentsProcessed: number;
  averageSessionDuration: number;
}

export interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  period?: TimeRange;
  city?: string;
  location?: string;
  rating?: CustomerRating;
  level?: EmployeeLevel;
}
