import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { CreditScore, PaymentPrediction, DebtRiskAnalysis, PredictionStats, TrendAnalysis, RiskLevel } from '@/types/prediction';
import { useDebts } from './debt-context';

export const [PredictionProvider, usePrediction] = createContextHook(() => {
  const [creditScores, setCreditScores] = useState<CreditScore[]>([]);
  const [predictions, setPredictions] = useState<PaymentPrediction[]>([]);
  const [riskAnalyses, setRiskAnalyses] = useState<DebtRiskAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const { debts, payments } = useDebts();

  const calculateCreditScore = (customerId: string, customerName: string): CreditScore => {
    const customerDebts = debts.filter(d => d.customerId === customerId);
    const customerPayments = payments.filter(p => {
      const debt = debts.find(d => d.id === p.debtId);
      return debt?.customerId === customerId;
    });

    const totalDebt = customerDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const overdueDebts = customerDebts.filter(d => {
      if (!d.dueDate) return false;
      return new Date(d.dueDate) < new Date() && d.remainingAmount > 0;
    });

    const paymentHistoryScore = customerPayments.length > 0 ? Math.min(100, customerPayments.length * 5) : 0;
    const debtAmountScore = totalDebt > 0 ? Math.max(0, 100 - (totalDebt / 10000) * 10) : 100;
    const overdueRateScore = customerDebts.length > 0 
      ? Math.max(0, 100 - (overdueDebts.length / customerDebts.length) * 100)
      : 100;

    const accountAge = customerDebts.length > 0 
      ? Math.floor((Date.now() - new Date(customerDebts[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const accountAgeScore = Math.min(100, accountAge / 3);

    const paymentFrequencyScore = customerPayments.length > 0 && customerDebts.length > 0
      ? Math.min(100, (customerPayments.length / customerDebts.length) * 100)
      : 50;

    const score = Math.round(
      (paymentHistoryScore * 0.35) +
      (debtAmountScore * 0.25) +
      (overdueRateScore * 0.25) +
      (accountAgeScore * 0.10) +
      (paymentFrequencyScore * 0.05)
    );

    let riskLevel: RiskLevel;
    if (score >= 80) riskLevel = 'low';
    else if (score >= 60) riskLevel = 'medium';
    else if (score >= 40) riskLevel = 'high';
    else riskLevel = 'critical';

    const recommendations: string[] = [];
    if (overdueDebts.length > 0) recommendations.push('پارەدانی قەرزە دواکەوتووەکان');
    if (totalDebt > 50000) recommendations.push('کەمکردنەوەی بڕی قەرز');
    if (customerPayments.length < 5) recommendations.push('دروستکردنی مێژووی پارەدانی باش');

    return {
      customerId,
      customerName,
      score,
      riskLevel,
      calculatedAt: new Date().toISOString(),
      factors: {
        paymentHistory: Math.round(paymentHistoryScore),
        debtAmount: Math.round(debtAmountScore),
        paymentFrequency: Math.round(paymentFrequencyScore),
        accountAge: Math.round(accountAgeScore),
        overdueRate: Math.round(overdueRateScore),
      },
      recommendations,
    };
  };

  const predictPayment = (customerId: string, customerName: string): PaymentPrediction | null => {
    const customerPayments = payments
      .filter(p => {
        const debt = debts.find(d => d.id === p.debtId);
        return debt?.customerId === customerId;
      })
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    if (customerPayments.length < 2) return null;

    const paymentDates = customerPayments.map(p => new Date(p.paymentDate).getTime());
    const intervals = [];
    for (let i = 0; i < paymentDates.length - 1; i++) {
      intervals.push(paymentDates[i] - paymentDates[i + 1]);
    }

    const averageInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const lastPaymentDate = new Date(customerPayments[0].paymentDate);
    const predictedDate = new Date(lastPaymentDate.getTime() + averageInterval);

    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - averageInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    const confidence = Math.max(0, Math.min(100, 100 - (standardDeviation / averageInterval) * 100));

    const averageAmount = customerPayments.reduce((sum, p) => sum + p.amount, 0) / customerPayments.length;

    return {
      customerId,
      customerName,
      predictedPaymentDate: predictedDate.toISOString(),
      confidence: Math.round(confidence),
      amount: Math.round(averageAmount),
      basedOn: {
        historicalPattern: `${customerPayments.length} پارەدان`,
        averagePaymentCycle: Math.round(averageInterval / (1000 * 60 * 60 * 24)),
        lastPaymentDate: lastPaymentDate.toISOString(),
      },
    };
  };

  const analyzeDebtRisk = (customerId: string, customerName: string): DebtRiskAnalysis => {
    const creditScore = calculateCreditScore(customerId, customerName);
    const customerDebts = debts.filter(d => d.customerId === customerId);
    const currentDebt = customerDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

    const probabilityOfDefault = Math.max(0, Math.min(100, 100 - creditScore.score));
    const recommendedCreditLimit = Math.round((creditScore.score / 100) * 100000);

    const warnings: string[] = [];
    const strengths: string[] = [];

    if (creditScore.riskLevel === 'critical' || creditScore.riskLevel === 'high') {
      warnings.push('مێژووی پارەدانی لاواز');
    }
    if (currentDebt > 50000) {
      warnings.push('بڕی قەرز زۆرە');
    }
    if (creditScore.factors.overdueRate < 50) {
      warnings.push('ڕێژەی دواکەوتن بەرزە');
    }

    if (creditScore.factors.paymentHistory > 70) {
      strengths.push('مێژووی پارەدانی باش');
    }
    if (creditScore.factors.accountAge > 70) {
      strengths.push('تەمەنی هەژمار درێژە');
    }

    return {
      customerId,
      customerName,
      currentDebt,
      riskLevel: creditScore.riskLevel,
      probabilityOfDefault: Math.round(probabilityOfDefault),
      recommendedCreditLimit,
      warnings,
      strengths,
    };
  };

  const calculateStats = (): PredictionStats => {
    const scores = creditScores;
    const highRisk = scores.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;
    const avgScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      : 0;

    return {
      totalCustomersAnalyzed: scores.length,
      highRiskCustomers: highRisk,
      averageCreditScore: Math.round(avgScore),
      predictedDefaultsThisMonth: Math.round(highRisk * 0.3),
      accuracyRate: 85,
      lastUpdated: new Date().toISOString(),
    };
  };

  const analyzeTrends = (): TrendAnalysis => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const lastMonthDebts = debts.filter(d => new Date(d.createdAt) >= lastMonth);
    const twoMonthsAgoDebts = debts.filter(d => new Date(d.createdAt) >= twoMonthsAgo && new Date(d.createdAt) < lastMonth);

    const lastMonthTotal = lastMonthDebts.reduce((sum, d) => sum + d.amount, 0);
    const twoMonthsAgoTotal = twoMonthsAgoDebts.reduce((sum, d) => sum + d.amount, 0);

    let totalDebtTrend: 'increasing' | 'decreasing' | 'stable';
    if (lastMonthTotal > twoMonthsAgoTotal * 1.1) totalDebtTrend = 'increasing';
    else if (lastMonthTotal < twoMonthsAgoTotal * 0.9) totalDebtTrend = 'decreasing';
    else totalDebtTrend = 'stable';

    const lastMonthPayments = payments.filter(p => new Date(p.paymentDate) >= lastMonth);
    const twoMonthsAgoPayments = payments.filter(p => new Date(p.paymentDate) >= twoMonthsAgo && new Date(p.paymentDate) < lastMonth);

    let paymentRateTrend: 'improving' | 'declining' | 'stable';
    if (lastMonthPayments.length > twoMonthsAgoPayments.length * 1.1) paymentRateTrend = 'improving';
    else if (lastMonthPayments.length < twoMonthsAgoPayments.length * 0.9) paymentRateTrend = 'declining';
    else paymentRateTrend = 'stable';

    return {
      period: `${lastMonth.toLocaleDateString('ku')} - ${now.toLocaleDateString('ku')}`,
      totalDebtTrend,
      paymentRateTrend,
      newCustomersTrend: 'stable',
      predictions: {
        nextMonthDebt: Math.round(lastMonthTotal * 1.05),
        nextMonthPayments: Math.round(lastMonthPayments.length * 1.02),
        expectedDefaultRate: 5,
      },
    };
  };

  const refreshAnalysis = async () => {
    setLoading(true);
    try {
      const uniqueCustomers = Array.from(new Set(debts.map(d => d.customerId)));
      
      const scores: CreditScore[] = [];
      const preds: PaymentPrediction[] = [];
      const risks: DebtRiskAnalysis[] = [];

      uniqueCustomers.forEach(customerId => {
        const debt = debts.find(d => d.customerId === customerId);
        if (!debt) return;

        const customerName = debt.customerName;
        scores.push(calculateCreditScore(customerId, customerName));
        
        const prediction = predictPayment(customerId, customerName);
        if (prediction) preds.push(prediction);
        
        risks.push(analyzeDebtRisk(customerId, customerName));
      });

      setCreditScores(scores);
      setPredictions(preds);
      setRiskAnalyses(risks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debts.length > 0) {
      refreshAnalysis();
    }
  }, [debts.length]);

  return {
    creditScores,
    predictions,
    riskAnalyses,
    loading,
    calculateCreditScore,
    predictPayment,
    analyzeDebtRisk,
    calculateStats,
    analyzeTrends,
    refreshAnalysis,
  };
});
