export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface CreditScore {
  customerId: string;
  customerName: string;
  score: number;
  riskLevel: RiskLevel;
  calculatedAt: string;
  factors: {
    paymentHistory: number;
    debtAmount: number;
    paymentFrequency: number;
    accountAge: number;
    overdueRate: number;
  };
  recommendations: string[];
}

export interface PaymentPrediction {
  customerId: string;
  customerName: string;
  predictedPaymentDate: string;
  confidence: number;
  amount: number;
  basedOn: {
    historicalPattern: string;
    averagePaymentCycle: number;
    lastPaymentDate: string;
  };
}

export interface DebtRiskAnalysis {
  customerId: string;
  customerName: string;
  currentDebt: number;
  riskLevel: RiskLevel;
  probabilityOfDefault: number;
  recommendedCreditLimit: number;
  warnings: string[];
  strengths: string[];
}

export interface PredictionStats {
  totalCustomersAnalyzed: number;
  highRiskCustomers: number;
  averageCreditScore: number;
  predictedDefaultsThisMonth: number;
  accuracyRate: number;
  lastUpdated: string;
}

export interface TrendAnalysis {
  period: string;
  totalDebtTrend: 'increasing' | 'decreasing' | 'stable';
  paymentRateTrend: 'improving' | 'declining' | 'stable';
  newCustomersTrend: 'increasing' | 'decreasing' | 'stable';
  predictions: {
    nextMonthDebt: number;
    nextMonthPayments: number;
    expectedDefaultRate: number;
  };
}
