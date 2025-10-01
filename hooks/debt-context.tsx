import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Debt, Payment, SearchFilters, PaymentFilters } from '@/types/debt';
import { safeStorage } from '@/utils/storage';
import { useAuth } from '@/hooks/auth-context';

type BalanceDiscrepancy = {
  type: 'overpayment' | 'negative_balance';
  customerId: string;
  customerName: string;
  amount: number;
  description: string;
};

// Sample data for demonstration
const sampleDebts: Debt[] = [
  {
    id: '1',
    customerId: 'customer-1',
    customerName: 'ئەحمەد محەمەد',
    amount: 500000,
    remainingAmount: 300000,
    category: 'خۆراک',
    description: 'کڕینی خۆراک بۆ ماڵەوە',
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin',
    createdByName: 'بەڕێوەبەر',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    receiptNumber: 'R001',
    notes: 'کڕیارێکی باش'
  },
  {
    id: '2',
    customerId: 'customer-2',
    customerName: 'فاتیمە ئەحمەد',
    amount: 750000,
    remainingAmount: 0,
    category: 'جل و بەرگ',
    description: 'کڕینی جل و بەرگ',
    status: 'paid',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'employee-1',
    createdByName: 'کارمەند یەک',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    receiptNumber: 'R002',
    notes: 'پارەدانی تەواو'
  },
  {
    id: '3',
    customerId: 'customer-3',
    customerName: 'عەلی حەسەن',
    amount: 1200000,
    remainingAmount: 800000,
    category: 'سووتەمەنی',
    description: 'کڕینی بەنزین و گاز',
    status: 'active',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin',
    createdByName: 'بەڕێوەبەر',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
    receiptNumber: 'R003',
    notes: 'قەرزی بەسەرچوو'
  },
  {
    id: '4',
    customerId: 'customer-4',
    customerName: 'زەینەب مەحمود',
    amount: 300000,
    remainingAmount: 150000,
    category: 'خۆراک',
    description: 'کڕینی میوە و سەوزە',
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'employee-1',
    createdByName: 'کارمەند یەک',
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    receiptNumber: 'R004',
    notes: 'کڕیارێکی نوێ'
  },
  {
    id: '5',
    customerId: 'customer-5',
    customerName: 'یاسین ئیبراهیم',
    amount: 900000,
    remainingAmount: 900000,
    category: 'کەرەستەی ماڵ',
    description: 'کڕینی کەرەستەی ماڵ',
    status: 'active',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin',
    createdByName: 'بەڕێوەبەر',
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    receiptNumber: 'R005',
    notes: 'قەرزی نوێ'
  }
];

const samplePayments: Payment[] = [
  {
    id: 'payment-1',
    debtId: '1',
    amount: 200000,
    paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    receivedBy: 'admin',
    receivedByName: 'بەڕێوەبەر',
    notes: 'پارەدانی یەکەم'
  },
  {
    id: 'payment-2',
    debtId: '2',
    amount: 750000,
    paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    receivedBy: 'employee-1',
    receivedByName: 'کارمەند یەک',
    notes: 'پارەدانی تەواو'
  },
  {
    id: 'payment-3',
    debtId: '3',
    amount: 400000,
    paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    receivedBy: 'admin',
    receivedByName: 'بەڕێوەبەر',
    notes: 'پارەدانی بەشەکی'
  },
  {
    id: 'payment-4',
    debtId: '4',
    amount: 150000,
    paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    receivedBy: 'employee-1',
    receivedByName: 'کارمەند یەک',
    notes: 'پارەدانی یەکەم'
  }
];

const DEBTS_STORAGE_KEY = 'debts';
const PAYMENTS_STORAGE_KEY = 'payments';

export const [DebtProvider, useDebts] = createContextHook(() => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>(sampleDebts);
  const [payments, setPayments] = useState<Payment[]>(samplePayments);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const storedDebts = await safeStorage.getItem<Debt[]>(DEBTS_STORAGE_KEY, sampleDebts);
      const storedPayments = await safeStorage.getItem<Payment[]>(PAYMENTS_STORAGE_KEY, samplePayments);
      
      if (storedDebts) setDebts(storedDebts);
      if (storedPayments) setPayments(storedPayments);
    } catch (error) {
      console.error('Error loading debt data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDebts = useCallback(async (newDebts: Debt[]) => {
    setDebts(newDebts);
    await safeStorage.setItem(DEBTS_STORAGE_KEY, newDebts);
  }, []);

  const savePayments = useCallback(async (newPayments: Payment[]) => {
    setPayments(newPayments);
    await safeStorage.setItem(PAYMENTS_STORAGE_KEY, newPayments);
  }, []);

  const addDebt = useCallback(async (debtData: {
    customerId: string;
    customerName: string;
    amount: number;
    remainingAmount: number;
    description: string;
    category: string;
    notes?: string;
    status: 'active' | 'paid' | 'partial';
    dueDate?: string;
  }) => {
    try {
      const newDebt: Debt = {
        id: `debt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...debtData,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'unknown',
        createdByName: user?.name || 'نەناسراو',
        receiptNumber: `R${Date.now().toString().slice(-6)}`,
      };

      const updatedDebts = [...debts, newDebt];
      await saveDebts(updatedDebts);
      
      console.log('Debt added successfully:', newDebt.id);
      return newDebt;
    } catch (error) {
      console.error('Error adding debt:', error);
      throw error;
    }
  }, [debts, user, saveDebts]);

  const addPayment = useCallback(async (paymentData: {
    debtId: string;
    amount: number;
    notes?: string;
  }) => {
    try {
      const debt = debts.find(d => d.id === paymentData.debtId);
      if (!debt) {
        throw new Error('Debt not found');
      }

      if (paymentData.amount > debt.remainingAmount) {
        throw new Error('Payment amount exceeds remaining debt');
      }

      const newPayment: Payment = {
        id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        debtId: paymentData.debtId,
        amount: paymentData.amount,
        paymentDate: new Date().toISOString(),
        receivedBy: user?.id || 'unknown',
        receivedByName: user?.name || 'نەناسراو',
        notes: paymentData.notes,
      };

      const updatedPayments = [...payments, newPayment];
      await savePayments(updatedPayments);

      const newRemainingAmount = debt.remainingAmount - paymentData.amount;
      const updatedDebts = debts.map(d => {
        if (d.id === paymentData.debtId) {
          return {
            ...d,
            remainingAmount: newRemainingAmount,
            status: newRemainingAmount === 0 ? ('paid' as const) : d.status,
          };
        }
        return d;
      });
      await saveDebts(updatedDebts);

      console.log('Payment added successfully:', newPayment.id);
      return newPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }, [debts, payments, user, saveDebts, savePayments]);

  const getSummary = useCallback(() => {
    const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalRemaining = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const activeDebtsCount = debts.filter(debt => debt.remainingAmount > 0).length;
    const paidDebtsCount = debts.filter(debt => debt.remainingAmount === 0).length;

    return {
      totalDebts,
      totalPaid,
      totalRemaining,
      activeDebtsCount,
      paidDebtsCount,
    };
  }, [debts, payments]);

  const getHighDebtCustomers = useCallback((minAmount: number = 0) => {
    const customerDebts = new Map<string, { customerId: string; customerName: string; totalDebt: number }>();
    
    debts.forEach(debt => {
      const existing = customerDebts.get(debt.customerId) || {
        customerId: debt.customerId,
        customerName: debt.customerName,
        totalDebt: 0,
      };
      existing.totalDebt += debt.remainingAmount;
      customerDebts.set(debt.customerId, existing);
    });
    
    return Array.from(customerDebts.values())
      .filter(customer => customer.totalDebt >= minAmount)
      .sort((a, b) => b.totalDebt - a.totalDebt);
  }, [debts]);

  const getOverdueDebts = useCallback(() => {
    const now = new Date();
    return debts.filter(debt => {
      if (!debt.dueDate || debt.remainingAmount === 0) return false;
      return new Date(debt.dueDate) < now;
    });
  }, [debts]);

  const getUnpaidDebts = useCallback(() => {
    return debts.filter(debt => debt.remainingAmount > 0);
  }, [debts]);

  const getMonthlyPaymentReport = useCallback(() => {
    const monthlyData = new Map<string, number>();
    
    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + payment.amount);
    });
    
    return Array.from(monthlyData.entries()).map(([month, amount]) => ({
      month,
      amount,
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [payments]);

  const getYearlyPaymentReport = useCallback(() => {
    const yearlyData = new Map<string, number>();
    
    payments.forEach(payment => {
      const year = new Date(payment.paymentDate).getFullYear().toString();
      yearlyData.set(year, (yearlyData.get(year) || 0) + payment.amount);
    });
    
    return Array.from(yearlyData.entries()).map(([year, amount]) => ({
      year,
      amount,
    })).sort((a, b) => a.year.localeCompare(b.year));
  }, [payments]);

  // Advanced search and filtering functions
  const searchDebts = useCallback((filters: SearchFilters) => {
    let filteredDebts = [...debts];

    // Text search in multiple fields
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredDebts = filteredDebts.filter(debt => 
        debt.customerName.toLowerCase().includes(searchLower) ||
        debt.description.toLowerCase().includes(searchLower) ||
        debt.category.toLowerCase().includes(searchLower) ||
        debt.notes?.toLowerCase().includes(searchLower) ||
        debt.id.toLowerCase().includes(searchLower)
      );
    }

    // Receipt number search
    if (filters.receiptNumber) {
      filteredDebts = filteredDebts.filter(debt => 
        debt.receiptNumber?.includes(filters.receiptNumber!)
      );
    }

    // Customer filter
    if (filters.customerId) {
      filteredDebts = filteredDebts.filter(debt => debt.customerId === filters.customerId);
    }

    // Employee filter
    if (filters.employeeId) {
      filteredDebts = filteredDebts.filter(debt => debt.createdBy === filters.employeeId);
    }

    // Category filter
    if (filters.category) {
      filteredDebts = filteredDebts.filter(debt => debt.category === filters.category);
    }

    // Amount range filter
    if (filters.minAmount !== undefined) {
      filteredDebts = filteredDebts.filter(debt => debt.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filteredDebts = filteredDebts.filter(debt => debt.amount <= filters.maxAmount!);
    }

    // Date range filter
    if (filters.startDate) {
      filteredDebts = filteredDebts.filter(debt => 
        new Date(debt.createdAt) >= new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      filteredDebts = filteredDebts.filter(debt => 
        new Date(debt.createdAt) <= new Date(filters.endDate!)
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredDebts = filteredDebts.filter(debt => debt.status === filters.status);
    }

    // Payment status filter
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      if (filters.paymentStatus === 'complete') {
        filteredDebts = filteredDebts.filter(debt => debt.remainingAmount === 0);
      } else if (filters.paymentStatus === 'incomplete') {
        filteredDebts = filteredDebts.filter(debt => debt.remainingAmount > 0);
      }
    }

    // Sorting
    if (filters.sortBy) {
      filteredDebts.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'customer':
            aValue = a.customerName;
            bValue = b.customerName;
            break;
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filteredDebts;
  }, [debts]);

  const searchPayments = useCallback((filters: PaymentFilters) => {
    let filteredPayments = [...payments];

    // Text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredPayments = filteredPayments.filter(payment => {
        const debt = debts.find(d => d.id === payment.debtId);
        return debt?.customerName.toLowerCase().includes(searchLower) ||
               payment.receivedByName.toLowerCase().includes(searchLower) ||
               payment.notes?.toLowerCase().includes(searchLower) ||
               payment.id.toLowerCase().includes(searchLower);
      });
    }

    // Receipt number search
    if (filters.receiptNumber) {
      filteredPayments = filteredPayments.filter(payment => {
        const debt = debts.find(d => d.id === payment.debtId);
        return debt?.receiptNumber?.includes(filters.receiptNumber!);
      });
    }

    // Customer filter
    if (filters.customerId) {
      filteredPayments = filteredPayments.filter(payment => {
        const debt = debts.find(d => d.id === payment.debtId);
        return debt?.customerId === filters.customerId;
      });
    }

    // Employee filter
    if (filters.employeeId) {
      filteredPayments = filteredPayments.filter(payment => 
        payment.receivedBy === filters.employeeId
      );
    }

    // Amount range filter
    if (filters.minAmount !== undefined) {
      filteredPayments = filteredPayments.filter(payment => payment.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filteredPayments = filteredPayments.filter(payment => payment.amount <= filters.maxAmount!);
    }

    // Date range filter
    if (filters.startDate) {
      filteredPayments = filteredPayments.filter(payment => 
        new Date(payment.paymentDate) >= new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      filteredPayments = filteredPayments.filter(payment => 
        new Date(payment.paymentDate) <= new Date(filters.endDate!)
      );
    }

    // Sorting
    if (filters.sortBy) {
      filteredPayments.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.paymentDate);
            bValue = new Date(b.paymentDate);
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'customer':
            const debtA = debts.find(d => d.id === a.debtId);
            const debtB = debts.find(d => d.id === b.debtId);
            aValue = debtA?.customerName || '';
            bValue = debtB?.customerName || '';
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filteredPayments;
  }, [payments, debts]);

  const getNewDebts = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return debts.filter(debt => new Date(debt.createdAt) >= cutoffDate);
  }, [debts]);

  const getNewPayments = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return payments.filter(payment => new Date(payment.paymentDate) >= cutoffDate);
  }, [payments]);

  const getDebtsByAmountRange = useCallback((range: 'small' | 'medium' | 'large') => {
    const amounts = debts.map(d => d.amount).sort((a, b) => a - b);
    const third = Math.floor(amounts.length / 3);
    
    let minAmount = 0, maxAmount = Infinity;
    
    if (range === 'small') {
      maxAmount = amounts[third] || 0;
    } else if (range === 'medium') {
      minAmount = amounts[third] || 0;
      maxAmount = amounts[third * 2] || Infinity;
    } else if (range === 'large') {
      minAmount = amounts[third * 2] || 0;
    }
    
    return debts.filter(debt => debt.amount >= minAmount && debt.amount <= maxAmount);
  }, [debts]);

  const searchAllData = useCallback((searchText: string) => {
    const searchLower = searchText.toLowerCase();
    
    const matchingDebts = debts.filter(debt => 
      debt.customerName.toLowerCase().includes(searchLower) ||
      debt.description.toLowerCase().includes(searchLower) ||
      debt.category.toLowerCase().includes(searchLower) ||
      debt.notes?.toLowerCase().includes(searchLower) ||
      debt.receiptNumber?.toLowerCase().includes(searchLower)
    );
    
    const matchingPayments = payments.filter(payment => {
      const debt = debts.find(d => d.id === payment.debtId);
      return debt?.customerName.toLowerCase().includes(searchLower) ||
             payment.receivedByName.toLowerCase().includes(searchLower) ||
             payment.notes?.toLowerCase().includes(searchLower);
    });
    
    return {
      debts: matchingDebts,
      payments: matchingPayments,
    };
  }, [debts, payments]);

  // Financial reporting functions (Section 13: 241-260)
  const getIrregularPaymentReport = useCallback(() => {
    // Find payments that are unusual (very small, very large, or inconsistent)
    const averagePayment = payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0;
    const standardDeviation = Math.sqrt(
      payments.reduce((sum, p) => sum + Math.pow(p.amount - averagePayment, 2), 0) / payments.length
    );
    
    const irregularPayments = payments.filter(payment => {
      const deviation = Math.abs(payment.amount - averagePayment);
      return deviation > standardDeviation * 2; // More than 2 standard deviations
    });
    
    return irregularPayments.map(payment => {
      const debt = debts.find(d => d.id === payment.debtId);
      return {
        ...payment,
        customerName: debt?.customerName || 'نەناسراو',
        debtAmount: debt?.amount || 0,
        irregularityReason: payment.amount < averagePayment * 0.1 ? 'پارەدانی زۆر کەم' : 
                           payment.amount > averagePayment * 5 ? 'پارەدانی زۆر زۆر' : 'پارەدانی نائاسایی',
      };
    });
  }, [debts, payments]);

  const getBestPayingCustomers = useCallback((minPayments: number = 3) => {
    const customerPayments = new Map<string, { 
      customerId: string; 
      customerName: string; 
      totalPaid: number; 
      paymentCount: number;
      averagePayment: number;
      consistency: number; // How regular their payments are
    }>();
    
    payments.forEach(payment => {
      const debt = debts.find(d => d.id === payment.debtId);
      if (!debt) return;
      
      const existing = customerPayments.get(debt.customerId) || {
        customerId: debt.customerId,
        customerName: debt.customerName,
        totalPaid: 0,
        paymentCount: 0,
        averagePayment: 0,
        consistency: 0,
      };
      
      existing.totalPaid += payment.amount;
      existing.paymentCount += 1;
      customerPayments.set(debt.customerId, existing);
    });
    
    return Array.from(customerPayments.values())
      .filter(customer => customer.paymentCount >= minPayments)
      .map(customer => ({
        ...customer,
        averagePayment: customer.totalPaid / customer.paymentCount,
        consistency: customer.paymentCount / Math.max(1, debts.filter(d => d.customerId === customer.customerId).length),
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid);
  }, [debts, payments]);

  const getFinancialHealthReport = useCallback(() => {
    const summary = getSummary();
    const totalCustomers = new Set(debts.map(d => d.customerId)).size;
    const activeCustomers = new Set(debts.filter(d => d.remainingAmount > 0).map(d => d.customerId)).size;
    const overdueDebts = getOverdueDebts();
    const unpaidDebts = getUnpaidDebts();
    
    // Calculate financial health metrics
    const collectionRate = summary.totalDebts > 0 ? (summary.totalPaid / summary.totalDebts) * 100 : 0;
    const overdueRate = debts.length > 0 ? (overdueDebts.length / debts.length) * 100 : 0;
    const customerRetentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;
    
    // Risk assessment
    let riskLevel: 'منخفض' | 'متوسط' | 'عالي' = 'منخفض';
    if (overdueRate > 30 || collectionRate < 60) {
      riskLevel = 'عالي';
    } else if (overdueRate > 15 || collectionRate < 80) {
      riskLevel = 'متوسط';
    }
    
    return {
      totalDebts: summary.totalDebts,
      totalPaid: summary.totalPaid,
      totalRemaining: summary.totalRemaining,
      collectionRate,
      overdueRate,
      customerRetentionRate,
      totalCustomers,
      activeCustomers,
      overdueAmount: overdueDebts.reduce((sum, d) => sum + d.remainingAmount, 0),
      unpaidAmount: unpaidDebts.reduce((sum, d) => sum + d.remainingAmount, 0),
      riskLevel,
      recommendations: [
        collectionRate < 70 ? 'تحسين عملية تحصيل الديون' : null,
        overdueRate > 20 ? 'متابعة الديون المتأخرة بشكل أكثر فعالية' : null,
        summary.totalRemaining > summary.totalPaid ? 'زيادة جهود التحصيل' : null,
      ].filter(Boolean),
    };
  }, [debts, getSummary, getOverdueDebts, getUnpaidDebts]);

  const exportFinancialData = useCallback((format: 'csv' | 'json' = 'csv') => {
    const summary = getSummary();
    const healthReport = getFinancialHealthReport();
    const bestCustomers = getBestPayingCustomers();
    const irregularPayments = getIrregularPaymentReport();
    
    const exportData = {
      summary,
      healthReport,
      bestCustomers: bestCustomers.slice(0, 10),
      irregularPayments: irregularPayments.slice(0, 20),
      debts: debts.map(debt => ({
        id: debt.id,
        customerName: debt.customerName,
        amount: debt.amount,
        remainingAmount: debt.remainingAmount,
        category: debt.category,
        status: debt.status,
        createdAt: debt.createdAt,
        dueDate: debt.dueDate,
      })),
      payments: payments.map(payment => {
        const debt = debts.find(d => d.id === payment.debtId);
        return {
          id: payment.id,
          customerName: debt?.customerName || 'نەناسراو',
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          receivedByName: payment.receivedByName,
        };
      }),
      exportDate: new Date().toISOString(),
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    // Convert to CSV format
    const csvLines = [];
    csvLines.push('نوع البيانات,القيمة');
    csvLines.push(`إجمالي الديون,${summary.totalDebts}`);
    csvLines.push(`إجمالي المدفوع,${summary.totalPaid}`);
    csvLines.push(`المتبقي,${summary.totalRemaining}`);
    csvLines.push(`معدل التحصيل,${healthReport.collectionRate.toFixed(2)}%`);
    csvLines.push(`معدل التأخير,${healthReport.overdueRate.toFixed(2)}%`);
    
    return csvLines.join('\n');
  }, [debts, payments, getSummary, getFinancialHealthReport, getBestPayingCustomers, getIrregularPaymentReport]);

  const checkBalanceDiscrepancies = useCallback(() => {
    const discrepancies: BalanceDiscrepancy[] = [];
    
    // Check if total payments exceed total debts for any customer
    const customerTotals = new Map<string, { totalDebt: number; totalPaid: number; customerName: string }>();
    
    debts.forEach(debt => {
      const existing = customerTotals.get(debt.customerId) || { 
        totalDebt: 0, 
        totalPaid: 0, 
        customerName: debt.customerName 
      };
      existing.totalDebt += debt.amount;
      customerTotals.set(debt.customerId, existing);
    });
    
    payments.forEach(payment => {
      const debt = debts.find(d => d.id === payment.debtId);
      if (debt) {
        const existing = customerTotals.get(debt.customerId);
        if (existing) {
          existing.totalPaid += payment.amount;
        }
      }
    });
    
    customerTotals.forEach((totals, customerId) => {
      if (totals.totalPaid > totals.totalDebt) {
        discrepancies.push({
          type: 'overpayment' as const,
          customerId,
          customerName: totals.customerName,
          amount: totals.totalPaid - totals.totalDebt,
          description: `الزبون دفع أكثر من المطلوب بمقدار ${totals.totalPaid - totals.totalDebt}`,
        });
      }
    });
    
    // Check for debts with negative remaining amounts
    debts.forEach(debt => {
      if (debt.remainingAmount < 0) {
        discrepancies.push({
          type: 'negative_balance' as const,
          customerId: debt.customerId,
          customerName: debt.customerName,
          amount: Math.abs(debt.remainingAmount),
          description: `دين برصيد سالب: ${debt.remainingAmount}`,
        });
      }
    });
    
    return discrepancies;
  }, [debts, payments]);

  // Get debts for a specific customer
  const getCustomerDebts = useCallback((customerId: string) => {
    return debts.filter(debt => debt.customerId === customerId);
  }, [debts]);

  // Get payments for a specific customer
  const getPaymentsByCustomer = useCallback((customerId: string) => {
    const customerDebtIds = debts
      .filter(debt => debt.customerId === customerId)
      .map(debt => debt.id);
    
    return payments.filter(payment => customerDebtIds.includes(payment.debtId));
  }, [debts, payments]);

  return useMemo(() => ({
    debts,
    payments,
    isLoading,
    addDebt,
    addPayment,
    getSummary,
    getHighDebtCustomers,
    getOverdueDebts,
    getUnpaidDebts,
    getMonthlyPaymentReport,
    getYearlyPaymentReport,
    searchDebts,
    searchPayments,
    getNewDebts,
    getNewPayments,
    getDebtsByAmountRange,
    searchAllData,
    getCustomerDebts,
    getPaymentsByCustomer,
    // Financial reporting functions (Section 13: 241-260)
    getIrregularPaymentReport,
    getBestPayingCustomers,
    getFinancialHealthReport,
    exportFinancialData,
    checkBalanceDiscrepancies,
  }), [debts, payments, isLoading, addDebt, addPayment, getSummary, getHighDebtCustomers, getOverdueDebts, getUnpaidDebts, getMonthlyPaymentReport, getYearlyPaymentReport, searchDebts, searchPayments, getNewDebts, getNewPayments, getDebtsByAmountRange, searchAllData, getCustomerDebts, getPaymentsByCustomer, getIrregularPaymentReport, getBestPayingCustomers, getFinancialHealthReport, exportFinancialData, checkBalanceDiscrepancies]);
});