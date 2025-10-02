export interface PredictiveAnalytics {
  customerId: string;
  customerName: string;
  predictions: {
    nextPaymentDate: string;
    nextPaymentAmount: number;
    paymentProbability: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendedAction: string;
  };
  historicalData: {
    averagePaymentAmount: number;
    averagePaymentDelay: number;
    totalPayments: number;
    totalDebts: number;
    paymentFrequency: number;
  };
  trends: {
    paymentTrend: 'improving' | 'stable' | 'declining';
    debtTrend: 'increasing' | 'stable' | 'decreasing';
    engagementScore: number;
  };
}

export interface DebtForecast {
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  predictions: {
    expectedNewDebts: number;
    expectedPayments: number;
    expectedBalance: number;
    confidence: number;
  };
  breakdown: {
    date: string;
    expectedDebts: number;
    expectedPayments: number;
    balance: number;
  }[];
}

export interface CustomerSegment {
  id: string;
  name: string;
  criteria: {
    minDebt?: number;
    maxDebt?: number;
    minPaymentRate?: number;
    maxPaymentRate?: number;
    riskLevel?: ('low' | 'medium' | 'high')[];
  };
  customers: string[];
  statistics: {
    totalCustomers: number;
    totalDebt: number;
    averageDebt: number;
    paymentRate: number;
  };
}

export interface PaymentPattern {
  customerId: string;
  pattern: {
    preferredDays: number[];
    preferredTimeOfMonth: 'early' | 'mid' | 'late';
    averageAmount: number;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'irregular';
  };
  reliability: {
    onTimePaymentRate: number;
    missedPaymentCount: number;
    averageDelay: number;
  };
}

export interface AnalyticsInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'info' | 'success';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedAction?: string;
  relatedCustomers?: string[];
  createdAt: string;
}

export interface CashFlowForecast {
  period: string;
  startDate: string;
  endDate: string;
  forecast: {
    expectedIncome: number;
    expectedExpenses: number;
    netCashFlow: number;
    confidence: number;
  };
  daily: {
    date: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
}
