import { useState, useCallback, useMemo, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { 
  PredictiveAnalytics, 
  DebtForecast, 
  CustomerSegment, 
  PaymentPattern,
  AnalyticsInsight,
  CashFlowForecast 
} from '@/types/analytics';
import type { Customer } from '@/types/customer';
import type { Debt } from '@/types/debt';

export const [AnalyticsContext, useAnalytics] = createContextHook(() => {
  const [predictions, setPredictions] = useState<PredictiveAnalytics[]>([]);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generatePredictions = useCallback((customers: Customer[], debts: Debt[]): PredictiveAnalytics[] => {
    return customers.map(customer => {
      const customerDebts = debts.filter(d => d.customerId === customer.id);
      const totalDebt = customerDebts.reduce((sum, d) => sum + d.amount, 0);
      const remainingDebt = customerDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
      const paidAmount = totalDebt - remainingDebt;

      const paymentRate = totalDebt > 0 ? (paidAmount / totalDebt) * 100 : 0;
      const riskLevel: 'low' | 'medium' | 'high' = 
        paymentRate > 70 ? 'low' : 
        paymentRate > 40 ? 'medium' : 'high';

      const avgPaymentAmount = customerDebts.length > 0 ? paidAmount / customerDebts.length : 0;
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);

      return {
        customerId: customer.id,
        customerName: customer.name,
        predictions: {
          nextPaymentDate: nextPaymentDate.toISOString(),
          nextPaymentAmount: avgPaymentAmount,
          paymentProbability: paymentRate,
          riskLevel,
          recommendedAction: riskLevel === 'high' 
            ? 'پەیوەندی کردن بە کڕیار' 
            : riskLevel === 'medium' 
            ? 'بیرخستنەوەی پارەدان' 
            : 'بەردەوامبوون لەسەر چاودێری',
        },
        historicalData: {
          averagePaymentAmount: avgPaymentAmount,
          averagePaymentDelay: 0,
          totalPayments: customerDebts.length,
          totalDebts: customerDebts.length,
          paymentFrequency: customerDebts.length,
        },
        trends: {
          paymentTrend: paymentRate > 60 ? 'improving' : paymentRate > 30 ? 'stable' : 'declining',
          debtTrend: remainingDebt > totalDebt * 0.5 ? 'increasing' : 'decreasing',
          engagementScore: Math.min(100, paymentRate + 20),
        },
      };
    });
  }, []);

  const generateInsights = useCallback((customers: Customer[], debts: Debt[]): AnalyticsInsight[] => {
    const insights: AnalyticsInsight[] = [];

    const highRiskCustomers = customers.filter(customer => {
      const customerDebts = debts.filter(d => d.customerId === customer.id);
      const totalDebt = customerDebts.reduce((sum, d) => sum + d.amount, 0);
      const remainingDebt = customerDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
      const paidAmount = totalDebt - remainingDebt;
      const paymentRate = totalDebt > 0 ? (paidAmount / totalDebt) * 100 : 0;
      return paymentRate < 40 && totalDebt > 0;
    });

    if (highRiskCustomers.length > 0) {
      insights.push({
        id: Date.now().toString(),
        type: 'warning',
        title: 'کڕیارانی مەترسیدار',
        description: `${highRiskCustomers.length} کڕیار مەترسیی بەرز هەیە`,
        priority: 'high',
        actionable: true,
        suggestedAction: 'پەیوەندی کردن بە کڕیارەکان',
        relatedCustomers: highRiskCustomers.map(c => c.id),
        createdAt: new Date().toISOString(),
      });
    }

    const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
    const remainingDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const totalPaid = totalDebt - remainingDebt;
    const collectionRate = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;

    if (collectionRate > 70) {
      insights.push({
        id: (Date.now() + 1).toString(),
        type: 'success',
        title: 'ڕێژەی کۆکردنەوەی باش',
        description: `ڕێژەی کۆکردنەوە ${collectionRate.toFixed(1)}% یە`,
        priority: 'low',
        actionable: false,
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [customersData, debtsData] = await Promise.all([
        AsyncStorage.getItem('users'),
        AsyncStorage.getItem('debts'),
      ]);

      const customers: Customer[] = customersData ? JSON.parse(customersData) : [];
      const debts: Debt[] = debtsData ? JSON.parse(debtsData) : [];

      const newPredictions = generatePredictions(customers, debts);
      setPredictions(newPredictions);

      const newInsights = generateInsights(customers, debts);
      setInsights(newInsights);
    } catch (error) {
      console.error('[Analytics] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generatePredictions, generateInsights]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getDebtForecast = useCallback(async (period: 'week' | 'month' | 'quarter' | 'year'): Promise<DebtForecast> => {
    const startDate = new Date();
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarter':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'year':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    const debtsData = await AsyncStorage.getItem('debts');
    const debts: Debt[] = debtsData ? JSON.parse(debtsData) : [];

    const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
    const remainingDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const totalPaid = totalDebt - remainingDebt;
    const avgPaymentRate = totalDebt > 0 ? totalPaid / totalDebt : 0;

    const expectedNewDebts = debts.length * 0.2;
    const expectedPayments = totalDebt * avgPaymentRate * 0.3;
    const expectedBalance = totalDebt - totalPaid + (expectedNewDebts * 1000) - expectedPayments;

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      predictions: {
        expectedNewDebts,
        expectedPayments,
        expectedBalance,
        confidence: 75,
      },
      breakdown: [],
    };
  }, []);

  const getCustomerSegments = useCallback(async (): Promise<CustomerSegment[]> => {
    const segments: CustomerSegment[] = [
      {
        id: 'high-value',
        name: 'کڕیارانی بەنرخ',
        criteria: { minDebt: 5000 },
        customers: [],
        statistics: { totalCustomers: 0, totalDebt: 0, averageDebt: 0, paymentRate: 0 },
      },
      {
        id: 'at-risk',
        name: 'کڕیارانی مەترسیدار',
        criteria: { riskLevel: ['high'] },
        customers: [],
        statistics: { totalCustomers: 0, totalDebt: 0, averageDebt: 0, paymentRate: 0 },
      },
      {
        id: 'reliable',
        name: 'کڕیارانی متمانەپێکراو',
        criteria: { minPaymentRate: 70 },
        customers: [],
        statistics: { totalCustomers: 0, totalDebt: 0, averageDebt: 0, paymentRate: 0 },
      },
    ];

    return segments;
  }, []);

  const getPaymentPatterns = useCallback(async (customerId: string): Promise<PaymentPattern | null> => {
    const debtsData = await AsyncStorage.getItem('debts');
    const debts: Debt[] = debtsData ? JSON.parse(debtsData) : [];
    const customerDebts = debts.filter(d => d.customerId === customerId);

    if (customerDebts.length === 0) return null;

    const totalDebt = customerDebts.reduce((sum, d) => sum + d.amount, 0);
    const remainingDebt = customerDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const paidAmount = totalDebt - remainingDebt;
    const avgAmount = paidAmount / customerDebts.length;

    return {
      customerId,
      pattern: {
        preferredDays: [1, 15],
        preferredTimeOfMonth: 'mid',
        averageAmount: avgAmount,
        frequency: 'monthly',
      },
      reliability: {
        onTimePaymentRate: 80,
        missedPaymentCount: 0,
        averageDelay: 2,
      },
    };
  }, []);

  const getCashFlowForecast = useCallback(async (period: string): Promise<CashFlowForecast> => {
    const debtsData = await AsyncStorage.getItem('debts');
    const debts: Debt[] = debtsData ? JSON.parse(debtsData) : [];

    const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
    const remainingDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const totalPaid = totalDebt - remainingDebt;

    return {
      period,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      forecast: {
        expectedIncome: totalPaid * 0.3,
        expectedExpenses: 0,
        netCashFlow: totalPaid * 0.3,
        confidence: 70,
      },
      daily: [],
    };
  }, []);

  return useMemo(
    () => ({
      predictions,
      insights,
      isLoading,
      getDebtForecast,
      getCustomerSegments,
      getPaymentPatterns,
      getCashFlowForecast,
      refreshAnalytics: loadData,
    }),
    [predictions, insights, isLoading, getDebtForecast, getCustomerSegments, getPaymentPatterns, getCashFlowForecast, loadData]
  );
});
