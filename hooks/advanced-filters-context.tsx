import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { Customer, CustomerFilters } from '@/types/customer';
import { Debt, Payment, SearchFilters, PaymentFilters, Receipt, ReceiptFilters } from '@/types/debt';

export const [AdvancedFiltersProvider, useAdvancedFilters] = createContextHook(() => {
  const [savedFilters, setSavedFilters] = useState<{
    customer: CustomerFilters;
    debt: SearchFilters;
    payment: PaymentFilters;
    receipt: ReceiptFilters;
  }>({
    customer: {},
    debt: {},
    payment: {},
    receipt: {},
  });

  const filterCustomersByVIP = useCallback((customers: Customer[], vipLevel?: number) => {
    if (vipLevel === undefined) {
      return customers.filter(c => c.isVIP === true);
    }
    return customers.filter(c => c.isVIP === true && c.vipLevel === vipLevel);
  }, []);

  const filterCustomersByCity = useCallback((customers: Customer[], city: string) => {
    return customers.filter(c => c.city?.toLowerCase().includes(city.toLowerCase()));
  }, []);

  const filterCustomersByLocation = useCallback((customers: Customer[], location: string) => {
    return customers.filter(c => c.location?.toLowerCase().includes(location.toLowerCase()));
  }, []);

  const filterCustomersByUsageDuration = useCallback((
    customers: Customer[], 
    minDuration?: number, 
    maxDuration?: number
  ) => {
    return customers.filter(c => {
      if (!c.usageDuration) return false;
      if (minDuration !== undefined && c.usageDuration < minDuration) return false;
      if (maxDuration !== undefined && c.usageDuration > maxDuration) return false;
      return true;
    });
  }, []);

  const filterDebtsByVIP = useCallback((debts: Debt[], vipLevel?: number) => {
    if (vipLevel === undefined) {
      return debts.filter(d => d.isVIP === true);
    }
    return debts.filter(d => d.isVIP === true);
  }, []);

  const filterDebtsByCity = useCallback((debts: Debt[], city: string) => {
    return debts.filter(d => d.city?.toLowerCase().includes(city.toLowerCase()));
  }, []);

  const filterDebtsByLocation = useCallback((debts: Debt[], location: string) => {
    return debts.filter(d => d.location?.toLowerCase().includes(location.toLowerCase()));
  }, []);

  const filterDebtsByAmountRange = useCallback((debts: Debt[], range: 'small' | 'medium' | 'large') => {
    if (debts.length === 0) return [];
    
    const amounts = debts.map(d => d.amount).sort((a, b) => a - b);
    const third = Math.floor(amounts.length / 3);
    
    let minAmount = 0;
    let maxAmount = Infinity;
    
    if (range === 'small') {
      maxAmount = amounts[third] || 0;
    } else if (range === 'medium') {
      minAmount = amounts[third] || 0;
      maxAmount = amounts[third * 2] || Infinity;
    } else if (range === 'large') {
      minAmount = amounts[third * 2] || 0;
    }
    
    return debts.filter(d => d.amount >= minAmount && d.amount <= maxAmount);
  }, []);

  const filterPaymentsByVIP = useCallback((
    payments: Payment[], 
    debts: Debt[], 
    vipLevel?: number
  ) => {
    const vipDebtIds = debts
      .filter(d => vipLevel === undefined ? d.isVIP === true : d.isVIP === true)
      .map(d => d.id);
    
    return payments.filter(p => vipDebtIds.includes(p.debtId));
  }, []);

  const filterPaymentsByCity = useCallback((
    payments: Payment[], 
    debts: Debt[], 
    city: string
  ) => {
    const cityDebtIds = debts
      .filter(d => d.city?.toLowerCase().includes(city.toLowerCase()))
      .map(d => d.id);
    
    return payments.filter(p => cityDebtIds.includes(p.debtId));
  }, []);

  const filterPaymentsByLocation = useCallback((
    payments: Payment[], 
    debts: Debt[], 
    location: string
  ) => {
    const locationDebtIds = debts
      .filter(d => d.location?.toLowerCase().includes(location.toLowerCase()))
      .map(d => d.id);
    
    return payments.filter(p => locationDebtIds.includes(p.debtId));
  }, []);

  const filterPaymentsByAmountRange = useCallback((
    payments: Payment[], 
    range: 'small' | 'medium' | 'large'
  ) => {
    if (payments.length === 0) return [];
    
    const amounts = payments.map(p => p.amount).sort((a, b) => a - b);
    const third = Math.floor(amounts.length / 3);
    
    let minAmount = 0;
    let maxAmount = Infinity;
    
    if (range === 'small') {
      maxAmount = amounts[third] || 0;
    } else if (range === 'medium') {
      minAmount = amounts[third] || 0;
      maxAmount = amounts[third * 2] || Infinity;
    } else if (range === 'large') {
      minAmount = amounts[third * 2] || 0;
    }
    
    return payments.filter(p => p.amount >= minAmount && p.amount <= maxAmount);
  }, []);

  const filterReceiptsByAmountRange = useCallback((
    receipts: Receipt[], 
    range: 'small' | 'medium' | 'large'
  ) => {
    if (receipts.length === 0) return [];
    
    const amounts = receipts.map(r => r.amount).sort((a, b) => a - b);
    const third = Math.floor(amounts.length / 3);
    
    let minAmount = 0;
    let maxAmount = Infinity;
    
    if (range === 'small') {
      maxAmount = amounts[third] || 0;
    } else if (range === 'medium') {
      minAmount = amounts[third] || 0;
      maxAmount = amounts[third * 2] || Infinity;
    } else if (range === 'large') {
      minAmount = amounts[third * 2] || 0;
    }
    
    return receipts.filter(r => r.amount >= minAmount && r.amount <= maxAmount);
  }, []);

  const filterReceiptsByAmount = useCallback((
    receipts: Receipt[], 
    minAmount?: number, 
    maxAmount?: number
  ) => {
    return receipts.filter(r => {
      if (minAmount !== undefined && r.amount < minAmount) return false;
      if (maxAmount !== undefined && r.amount > maxAmount) return false;
      return true;
    });
  }, []);

  const filterReceiptsByDateRange = useCallback((
    receipts: Receipt[], 
    startDate?: string, 
    endDate?: string
  ) => {
    return receipts.filter(r => {
      const receiptDate = new Date(r.date);
      if (startDate && receiptDate < new Date(startDate)) return false;
      if (endDate && receiptDate > new Date(endDate)) return false;
      return true;
    });
  }, []);

  const applyAdvancedCustomerFilters = useCallback((
    customers: Customer[], 
    filters: CustomerFilters
  ) => {
    let filtered = [...customers];

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.phone?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.address?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.group) {
      filtered = filtered.filter(c => c.group === filters.group);
    }

    if (filters.rating !== undefined) {
      filtered = filtered.filter(c => c.rating === filters.rating);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.city) {
      filtered = filterCustomersByCity(filtered, filters.city);
    }

    if (filters.location) {
      filtered = filterCustomersByLocation(filtered, filters.location);
    }

    if (filters.isVIP !== undefined) {
      filtered = filtered.filter(c => c.isVIP === filters.isVIP);
    }

    if (filters.vipLevel !== undefined) {
      filtered = filterCustomersByVIP(filtered, filters.vipLevel);
    }

    if (filters.minUsageDuration !== undefined || filters.maxUsageDuration !== undefined) {
      filtered = filterCustomersByUsageDuration(
        filtered, 
        filters.minUsageDuration, 
        filters.maxUsageDuration
      );
    }

    if (filters.minTotalDebt !== undefined) {
      filtered = filtered.filter(c => c.totalDebt >= filters.minTotalDebt!);
    }

    if (filters.maxTotalDebt !== undefined) {
      filtered = filtered.filter(c => c.totalDebt <= filters.maxTotalDebt!);
    }

    if (filters.minTotalPaid !== undefined) {
      filtered = filtered.filter(c => c.totalPaid >= filters.minTotalPaid!);
    }

    if (filters.maxTotalPaid !== undefined) {
      filtered = filtered.filter(c => c.totalPaid <= filters.maxTotalPaid!);
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'totalDebt':
            aValue = a.totalDebt;
            bValue = b.totalDebt;
            break;
          case 'totalPaid':
            aValue = a.totalPaid;
            bValue = b.totalPaid;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'usageDuration':
            aValue = a.usageDuration || 0;
            bValue = b.usageDuration || 0;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filtered;
  }, [filterCustomersByCity, filterCustomersByLocation, filterCustomersByVIP, filterCustomersByUsageDuration]);

  const applyAdvancedDebtFilters = useCallback((
    debts: Debt[], 
    filters: SearchFilters
  ) => {
    let filtered = [...debts];

    if (filters.city) {
      filtered = filterDebtsByCity(filtered, filters.city);
    }

    if (filters.location) {
      filtered = filterDebtsByLocation(filtered, filters.location);
    }

    if (filters.isVIP !== undefined) {
      filtered = filtered.filter(d => d.isVIP === filters.isVIP);
    }

    if (filters.amountRange) {
      filtered = filterDebtsByAmountRange(filtered, filters.amountRange);
    }

    return filtered;
  }, [filterDebtsByCity, filterDebtsByLocation, filterDebtsByAmountRange]);

  const applyAdvancedPaymentFilters = useCallback((
    payments: Payment[], 
    debts: Debt[], 
    filters: PaymentFilters
  ) => {
    let filtered = [...payments];

    if (filters.city) {
      filtered = filterPaymentsByCity(filtered, debts, filters.city);
    }

    if (filters.location) {
      filtered = filterPaymentsByLocation(filtered, debts, filters.location);
    }

    if (filters.isVIP !== undefined) {
      filtered = filterPaymentsByVIP(filtered, debts, filters.vipLevel);
    }

    if (filters.amountRange) {
      filtered = filterPaymentsByAmountRange(filtered, filters.amountRange);
    }

    return filtered;
  }, [filterPaymentsByCity, filterPaymentsByLocation, filterPaymentsByVIP, filterPaymentsByAmountRange]);

  const applyAdvancedReceiptFilters = useCallback((
    receipts: Receipt[], 
    filters: ReceiptFilters
  ) => {
    let filtered = [...receipts];

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      filtered = filterReceiptsByAmount(filtered, filters.minAmount, filters.maxAmount);
    }

    if (filters.amountRange) {
      filtered = filterReceiptsByAmountRange(filtered, filters.amountRange);
    }

    if (filters.startDate || filters.endDate) {
      filtered = filterReceiptsByDateRange(filtered, filters.startDate, filters.endDate);
    }

    return filtered;
  }, [filterReceiptsByAmount, filterReceiptsByAmountRange, filterReceiptsByDateRange]);

  const saveCustomerFilters = useCallback((filters: CustomerFilters) => {
    setSavedFilters(prev => ({ ...prev, customer: filters }));
  }, []);

  const saveDebtFilters = useCallback((filters: SearchFilters) => {
    setSavedFilters(prev => ({ ...prev, debt: filters }));
  }, []);

  const savePaymentFilters = useCallback((filters: PaymentFilters) => {
    setSavedFilters(prev => ({ ...prev, payment: filters }));
  }, []);

  const saveReceiptFilters = useCallback((filters: ReceiptFilters) => {
    setSavedFilters(prev => ({ ...prev, receipt: filters }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSavedFilters({
      customer: {},
      debt: {},
      payment: {},
      receipt: {},
    });
  }, []);

  const getVIPCustomersReport = useCallback((customers: Customer[]) => {
    const vipCustomers = customers.filter(c => c.isVIP === true);
    
    const byLevel = {
      level1: vipCustomers.filter(c => c.vipLevel === 1),
      level2: vipCustomers.filter(c => c.vipLevel === 2),
      level3: vipCustomers.filter(c => c.vipLevel === 3),
      level4: vipCustomers.filter(c => c.vipLevel === 4),
      level5: vipCustomers.filter(c => c.vipLevel === 5),
    };

    const totalVIPDebt = vipCustomers.reduce((sum, c) => sum + c.totalDebt, 0);
    const totalVIPPaid = vipCustomers.reduce((sum, c) => sum + c.totalPaid, 0);

    return {
      totalVIPCustomers: vipCustomers.length,
      byLevel,
      totalVIPDebt,
      totalVIPPaid,
      averageVIPDebt: vipCustomers.length > 0 ? totalVIPDebt / vipCustomers.length : 0,
      averageVIPPaid: vipCustomers.length > 0 ? totalVIPPaid / vipCustomers.length : 0,
    };
  }, []);

  return useMemo(() => ({
    savedFilters,
    filterCustomersByVIP,
    filterCustomersByCity,
    filterCustomersByLocation,
    filterCustomersByUsageDuration,
    filterDebtsByVIP,
    filterDebtsByCity,
    filterDebtsByLocation,
    filterDebtsByAmountRange,
    filterPaymentsByVIP,
    filterPaymentsByCity,
    filterPaymentsByLocation,
    filterPaymentsByAmountRange,
    filterReceiptsByAmountRange,
    filterReceiptsByAmount,
    filterReceiptsByDateRange,
    applyAdvancedCustomerFilters,
    applyAdvancedDebtFilters,
    applyAdvancedPaymentFilters,
    applyAdvancedReceiptFilters,
    saveCustomerFilters,
    saveDebtFilters,
    savePaymentFilters,
    saveReceiptFilters,
    clearAllFilters,
    getVIPCustomersReport,
  }), [
    savedFilters,
    filterCustomersByVIP,
    filterCustomersByCity,
    filterCustomersByLocation,
    filterCustomersByUsageDuration,
    filterDebtsByVIP,
    filterDebtsByCity,
    filterDebtsByLocation,
    filterDebtsByAmountRange,
    filterPaymentsByVIP,
    filterPaymentsByCity,
    filterPaymentsByLocation,
    filterPaymentsByAmountRange,
    filterReceiptsByAmountRange,
    filterReceiptsByAmount,
    filterReceiptsByDateRange,
    applyAdvancedCustomerFilters,
    applyAdvancedDebtFilters,
    applyAdvancedPaymentFilters,
    applyAdvancedReceiptFilters,
    saveCustomerFilters,
    saveDebtFilters,
    savePaymentFilters,
    saveReceiptFilters,
    clearAllFilters,
    getVIPCustomersReport,
  ]);
});
