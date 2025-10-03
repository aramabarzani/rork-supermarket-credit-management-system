export interface ProfitLossReport {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  revenue: RevenueBreakdown;
  expenses: ExpenseBreakdown;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  createdAt: string;
  createdBy: string;
}

export interface RevenueBreakdown {
  totalRevenue: number;
  debtRevenue: number;
  paymentRevenue: number;
  productSales: number;
  serviceRevenue: number;
  otherRevenue: number;
  breakdown: {
    category: string;
    categoryKurdish: string;
    amount: number;
    percentage: number;
  }[];
}

export interface ExpenseBreakdown {
  totalExpenses: number;
  operatingExpenses: number;
  costOfGoodsSold: number;
  salaries: number;
  rent: number;
  utilities: number;
  marketing: number;
  other: number;
  breakdown: {
    category: string;
    categoryKurdish: string;
    amount: number;
    percentage: number;
  }[];
}

export interface FinancialMetrics {
  period: string;
  revenue: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  revenueGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
  cashFlow: number;
  roi: number;
}

export interface CashFlowStatement {
  period: string;
  startDate: string;
  endDate: string;
  openingBalance: number;
  closingBalance: number;
  operatingActivities: {
    cashFromCustomers: number;
    cashToSuppliers: number;
    cashToEmployees: number;
    otherOperatingCash: number;
    netOperatingCash: number;
  };
  investingActivities: {
    purchaseOfAssets: number;
    saleOfAssets: number;
    netInvestingCash: number;
  };
  financingActivities: {
    loansReceived: number;
    loansRepaid: number;
    ownerInvestment: number;
    ownerWithdrawal: number;
    netFinancingCash: number;
  };
  netCashFlow: number;
}

export interface BalanceSheet {
  date: string;
  assets: {
    currentAssets: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      other: number;
      total: number;
    };
    fixedAssets: {
      equipment: number;
      furniture: number;
      vehicles: number;
      other: number;
      total: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayable: number;
      shortTermLoans: number;
      other: number;
      total: number;
    };
    longTermLiabilities: {
      longTermLoans: number;
      other: number;
      total: number;
    };
    totalLiabilities: number;
  };
  equity: {
    ownerEquity: number;
    retainedEarnings: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
}

export interface FinancialRatio {
  name: string;
  nameKurdish: string;
  value: number;
  category: 'profitability' | 'liquidity' | 'efficiency' | 'leverage';
  interpretation: string;
  interpretationKurdish: string;
  benchmark?: number;
  status: 'good' | 'average' | 'poor';
}

export const FINANCIAL_RATIOS = [
  {
    id: 'gross_profit_margin',
    name: 'Gross Profit Margin',
    nameKurdish: 'ڕێژەی قازانجی ناوخۆیی',
    formula: '(Revenue - COGS) / Revenue * 100',
    category: 'profitability' as const,
  },
  {
    id: 'net_profit_margin',
    name: 'Net Profit Margin',
    nameKurdish: 'ڕێژەی قازانجی پاک',
    formula: 'Net Profit / Revenue * 100',
    category: 'profitability' as const,
  },
  {
    id: 'current_ratio',
    name: 'Current Ratio',
    nameKurdish: 'ڕێژەی ئێستا',
    formula: 'Current Assets / Current Liabilities',
    category: 'liquidity' as const,
  },
  {
    id: 'debt_to_equity',
    name: 'Debt to Equity Ratio',
    nameKurdish: 'ڕێژەی قەرز بۆ سەرمایە',
    formula: 'Total Liabilities / Total Equity',
    category: 'leverage' as const,
  },
  {
    id: 'return_on_assets',
    name: 'Return on Assets (ROA)',
    nameKurdish: 'گەڕانەوەی سەرمایە',
    formula: 'Net Profit / Total Assets * 100',
    category: 'efficiency' as const,
  },
];
