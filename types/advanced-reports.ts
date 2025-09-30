export interface PeriodFilter {
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}

export interface LocationFilter {
  city?: string;
  location?: string;
}

export interface CustomerLevelFilter {
  isVIP?: boolean;
  vipLevel?: number;
  rating?: number;
}

export interface AdvancedReportFilters extends PeriodFilter, LocationFilter, CustomerLevelFilter {
  employeeId?: string;
  customerId?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface DebtReportByPeriod {
  period: string;
  totalDebts: number;
  totalAmount: number;
  averageAmount: number;
  categories: {
    category: string;
    amount: number;
    count: number;
  }[];
}

export interface PaymentReportByPeriod {
  period: string;
  totalPayments: number;
  totalAmount: number;
  averageAmount: number;
  paymentMethods?: {
    method: string;
    amount: number;
    count: number;
  }[];
}

export interface CustomerReportByLevel {
  level: string;
  customerCount: number;
  totalDebt: number;
  totalPaid: number;
  averageDebt: number;
  averagePaid: number;
}

export interface EmployeeReportByLevel {
  employeeId: string;
  employeeName: string;
  level: string;
  debtsCreated: number;
  paymentsReceived: number;
  totalDebtAmount: number;
  totalPaymentAmount: number;
}

export interface InactiveCustomersReport {
  customerId: string;
  customerName: string;
  lastActivityDate: string;
  daysSinceLastActivity: number;
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
}

export interface InactiveEmployeesReport {
  employeeId: string;
  employeeName: string;
  lastActivityDate: string;
  daysSinceLastActivity: number;
  totalDebtsCreated: number;
  totalPaymentsReceived: number;
}

export interface LocationBasedDebtReport {
  city?: string;
  location?: string;
  totalDebts: number;
  totalAmount: number;
  customerCount: number;
  averageDebtPerCustomer: number;
  topCustomers: {
    customerId: string;
    customerName: string;
    totalDebt: number;
  }[];
}

export interface LocationBasedPaymentReport {
  city?: string;
  location?: string;
  totalPayments: number;
  totalAmount: number;
  customerCount: number;
  averagePaymentPerCustomer: number;
  topPayers: {
    customerId: string;
    customerName: string;
    totalPaid: number;
  }[];
}

export interface VIPCustomerReport {
  customerId: string;
  customerName: string;
  vipLevel: number;
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
  lastPaymentDate?: string;
  paymentHistory: {
    date: string;
    amount: number;
  }[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}

export interface DebtByCustomerLevelChart extends ChartData {
  type: 'bar' | 'pie' | 'line';
}

export interface PaymentByCustomerLevelChart extends ChartData {
  type: 'bar' | 'pie' | 'line';
}

export interface DebtByCityChart extends ChartData {
  type: 'bar' | 'pie';
}

export interface PaymentByCityChart extends ChartData {
  type: 'bar' | 'pie';
}

export interface DebtByLocationChart extends ChartData {
  type: 'bar' | 'pie';
}

export interface PaymentByLocationChart extends ChartData {
  type: 'bar' | 'pie';
}

export interface DebtByEmployeeLevelChart extends ChartData {
  type: 'bar' | 'line';
}

export interface PaymentByEmployeeLevelChart extends ChartData {
  type: 'bar' | 'line';
}

export interface AllDebtsByDateReport {
  date: string;
  debts: {
    id: string;
    customerId: string;
    customerName: string;
    amount: number;
    category: string;
    createdBy: string;
    createdByName: string;
  }[];
  totalAmount: number;
  count: number;
}

export interface AllPaymentsByDateReport {
  date: string;
  payments: {
    id: string;
    debtId: string;
    customerId: string;
    customerName: string;
    amount: number;
    receivedBy: string;
    receivedByName: string;
  }[];
  totalAmount: number;
  count: number;
}
