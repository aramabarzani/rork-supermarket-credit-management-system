import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import type { GlobalSearchResponse, SearchResult } from '../../../../../types/global-search';

const searchFiltersSchema = z.object({
  query: z.string().optional(),
  entityType: z.enum(['customer', 'employee', 'debt', 'payment', 'all']).optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  debtNumber: z.string().optional(),
  paymentNumber: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
  customerType: z.enum(['VIP', 'Normal', 'all']).optional(),
  employeeRole: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
});

export const globalSearchProcedure = protectedProcedure
  .input(searchFiltersSchema)
  .query(async ({ input, ctx }): Promise<GlobalSearchResponse> => {
    console.log('[Global Search] Searching with filters:', input);

    const results: SearchResult[] = [];

    const shouldSearchCustomers = !input.entityType || input.entityType === 'all' || input.entityType === 'customer';
    const shouldSearchEmployees = !input.entityType || input.entityType === 'all' || input.entityType === 'employee';
    const shouldSearchDebts = !input.entityType || input.entityType === 'all' || input.entityType === 'debt';
    const shouldSearchPayments = !input.entityType || input.entityType === 'all' || input.entityType === 'payment';

    if (shouldSearchCustomers) {
      const customers = generateMockCustomers(input);
      results.push(...customers);
    }

    if (shouldSearchEmployees) {
      const employees = generateMockEmployees(input);
      results.push(...employees);
    }

    if (shouldSearchDebts) {
      const debts = generateMockDebts(input);
      results.push(...debts);
    }

    if (shouldSearchPayments) {
      const payments = generateMockPayments(input);
      results.push(...payments);
    }

    console.log(`[Global Search] Found ${results.length} results`);

    return {
      results,
      total: results.length,
      filters: input,
    };
  });

function generateMockCustomers(filters: any): SearchResult[] {
  const customers: SearchResult[] = [
    {
      id: '1',
      type: 'customer',
      title: 'ئەحمەد محەمەد',
      subtitle: '٠٧٥٠ ١٢٣ ٤٥٦٧',
      description: 'کڕیاری VIP - هەولێر',
      amount: 5000000,
      date: '2025-01-15',
      status: 'active',
      metadata: { customerType: 'VIP', city: 'هەولێر' },
    },
    {
      id: '2',
      type: 'customer',
      title: 'سارا ئیبراهیم',
      subtitle: '٠٧٧٠ ٩٨٧ ٦٥٤٣',
      description: 'کڕیاری ئاسایی - سلێمانی',
      amount: 2000000,
      date: '2025-02-10',
      status: 'active',
      metadata: { customerType: 'Normal', city: 'سلێمانی' },
    },
    {
      id: '3',
      type: 'customer',
      title: 'کەریم ڕەشید',
      subtitle: '٠٧٥١ ٢٣٤ ٥٦٧٨',
      description: 'کڕیاری VIP - دهۆک',
      amount: 8000000,
      date: '2025-01-20',
      status: 'active',
      metadata: { customerType: 'VIP', city: 'دهۆک' },
    },
  ];

  return customers.filter(customer => {
    if (filters.customerName && !customer.title.includes(filters.customerName)) return false;
    if (filters.customerPhone && !customer.subtitle?.includes(filters.customerPhone)) return false;
    if (filters.customerType && filters.customerType !== 'all' && customer.metadata?.customerType !== filters.customerType) return false;
    if (filters.city && customer.metadata?.city !== filters.city) return false;
    if (filters.query && !customer.title.includes(filters.query) && !customer.subtitle?.includes(filters.query)) return false;
    if (filters.amountMin && customer.amount && customer.amount < filters.amountMin) return false;
    if (filters.amountMax && customer.amount && customer.amount > filters.amountMax) return false;
    return true;
  });
}

function generateMockEmployees(filters: any): SearchResult[] {
  const employees: SearchResult[] = [
    {
      id: '1',
      type: 'employee',
      title: 'عومەر حەسەن',
      subtitle: 'کارمەند',
      description: 'بەڕێوەبەری لق - هەولێر',
      date: '2024-01-01',
      status: 'active',
      metadata: { role: 'manager', city: 'هەولێر' },
    },
    {
      id: '2',
      type: 'employee',
      title: 'ڕێناس ئەحمەد',
      subtitle: 'کارمەند',
      description: 'کارمەندی فرۆشتن - سلێمانی',
      date: '2024-03-15',
      status: 'active',
      metadata: { role: 'employee', city: 'سلێمانی' },
    },
  ];

  return employees.filter(employee => {
    if (filters.employeeRole && employee.metadata?.role !== filters.employeeRole) return false;
    if (filters.city && employee.metadata?.city !== filters.city) return false;
    if (filters.query && !employee.title.includes(filters.query) && !employee.description?.includes(filters.query)) return false;
    return true;
  });
}

function generateMockDebts(filters: any): SearchResult[] {
  const debts: SearchResult[] = [
    {
      id: 'D001',
      type: 'debt',
      title: 'قەرز #D001',
      subtitle: 'ئەحمەد محەمەد',
      description: 'قەرزی کڕینی کاڵا',
      amount: 1500000,
      date: '2025-01-10',
      status: 'pending',
      metadata: { customerId: '1', daysOverdue: 15 },
    },
    {
      id: 'D002',
      type: 'debt',
      title: 'قەرز #D002',
      subtitle: 'سارا ئیبراهیم',
      description: 'قەرزی خزمەتگوزاری',
      amount: 800000,
      date: '2025-02-05',
      status: 'pending',
      metadata: { customerId: '2', daysOverdue: 5 },
    },
    {
      id: 'D003',
      type: 'debt',
      title: 'قەرز #D003',
      subtitle: 'کەریم ڕەشید',
      description: 'قەرزی کڕینی کاڵا',
      amount: 3000000,
      date: '2025-01-25',
      status: 'overdue',
      metadata: { customerId: '3', daysOverdue: 60 },
    },
  ];

  return debts.filter(debt => {
    if (filters.debtNumber && !debt.id.includes(filters.debtNumber)) return false;
    if (filters.query && !debt.title.includes(filters.query) && !debt.subtitle?.includes(filters.query)) return false;
    if (filters.amountMin && debt.amount && debt.amount < filters.amountMin) return false;
    if (filters.amountMax && debt.amount && debt.amount > filters.amountMax) return false;
    if (filters.dateFrom && debt.date && debt.date < filters.dateFrom) return false;
    if (filters.dateTo && debt.date && debt.date > filters.dateTo) return false;
    return true;
  });
}

function generateMockPayments(filters: any): SearchResult[] {
  const payments: SearchResult[] = [
    {
      id: 'P001',
      type: 'payment',
      title: 'پارەدان #P001',
      subtitle: 'ئەحمەد محەمەد',
      description: 'پارەدانی قەرز D001',
      amount: 500000,
      date: '2025-01-20',
      status: 'completed',
      metadata: { customerId: '1', debtId: 'D001' },
    },
    {
      id: 'P002',
      type: 'payment',
      title: 'پارەدان #P002',
      subtitle: 'سارا ئیبراهیم',
      description: 'پارەدانی قەرز D002',
      amount: 300000,
      date: '2025-02-15',
      status: 'completed',
      metadata: { customerId: '2', debtId: 'D002' },
    },
    {
      id: 'P003',
      type: 'payment',
      title: 'پارەدان #P003',
      subtitle: 'کەریم ڕەشید',
      description: 'پارەدانی قەرز D003',
      amount: 1000000,
      date: '2025-02-01',
      status: 'completed',
      metadata: { customerId: '3', debtId: 'D003' },
    },
  ];

  return payments.filter(payment => {
    if (filters.paymentNumber && !payment.id.includes(filters.paymentNumber)) return false;
    if (filters.query && !payment.title.includes(filters.query) && !payment.subtitle?.includes(filters.query)) return false;
    if (filters.amountMin && payment.amount && payment.amount < filters.amountMin) return false;
    if (filters.amountMax && payment.amount && payment.amount > filters.amountMax) return false;
    if (filters.dateFrom && payment.date && payment.date < filters.dateFrom) return false;
    if (filters.dateTo && payment.date && payment.date > filters.dateTo) return false;
    return true;
  });
}

export const quickSearchSuggestionsProcedure = protectedProcedure
  .input(z.object({ query: z.string() }))
  .query(async ({ input }) => {
    console.log('[Quick Search] Getting suggestions for:', input.query);

    const suggestions = [
      { id: '1', text: 'ئەحمەد محەمەد', type: 'customer' as const, icon: 'user' },
      { id: '2', text: 'قەرز #D001', type: 'debt' as const, icon: 'file-text' },
      { id: '3', text: 'پارەدان #P001', type: 'payment' as const, icon: 'dollar-sign' },
      { id: '4', text: 'عومەر حەسەن', type: 'employee' as const, icon: 'users' },
    ];

    return suggestions.filter(s => 
      s.text.toLowerCase().includes(input.query.toLowerCase())
    );
  });
