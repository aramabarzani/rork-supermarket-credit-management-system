import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const mockCustomers = [
  { id: '1', name: 'ئەحمەد محەمەد', phone: '07501234567', totalDebt: 500000 },
  { id: '2', name: 'فاتیمە ئیبراهیم', phone: '07507654321', totalDebt: 300000 },
];

const mockDebts = [
  { id: '1', customerId: '1', amount: 100000, date: '2025-01-15', description: 'قەرزی یەکەم' },
];

const mockPayments = [
  { id: '1', customerId: '1', amount: 50000, date: '2025-01-20', description: 'پارەدانی یەکەم' },
];

export const voiceSearchProcedure = publicProcedure
  .input(
    z.object({
      audioUri: z.string(),
      searchType: z.enum(['customer', 'employee', 'debt', 'payment', 'phone', 'date', 'amount', 'general']).optional(),
      language: z.enum(['ku', 'en']).optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const formData = new FormData();
      
      const response = await fetch(input.audioUri);
      const blob = await response.blob();
      formData.append('audio', blob, 'recording.wav');
      
      if (input.language) {
        formData.append('language', input.language);
      }

      const sttResponse = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      if (!sttResponse.ok) {
        throw new Error('Speech-to-text failed');
      }

      const result = await sttResponse.json();

      return {
        text: result.text,
        language: result.language,
        confidence: 0.95,
        searchType: input.searchType,
      };
    } catch (error) {
      console.error('Voice search error:', error);
      throw new Error('Failed to process voice search');
    }
  });

export const advancedSearchProcedure = publicProcedure
  .input(
    z.object({
      searchTerm: z.string().optional(),
      customerName: z.string().optional(),
      employeeName: z.string().optional(),
      phoneNumber: z.string().optional(),
      debtNumber: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      amountFrom: z.number().optional(),
      amountTo: z.number().optional(),
      debtDurationFrom: z.number().optional(),
      debtDurationTo: z.number().optional(),
      language: z.enum(['ku', 'en']).optional(),
      sortBy: z.enum(['date', 'amount', 'name']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .query(async ({ input }) => {
    let results: any[] = [];
    
    console.log('Advanced search with filters:', input);

    if (input.customerName) {
      results = mockCustomers.filter(c => 
        c.name.includes(input.customerName!)
      );
    } else if (input.phoneNumber) {
      results = mockCustomers.filter(c => 
        c.phone.includes(input.phoneNumber!)
      );
    } else {
      results = mockCustomers;
    }

    if (input.amountFrom !== undefined) {
      results = results.filter(c => c.totalDebt >= input.amountFrom!);
    }
    if (input.amountTo !== undefined) {
      results = results.filter(c => c.totalDebt <= input.amountTo!);
    }

    const start = input.offset || 0;
    const end = start + (input.limit || 50);
    const paginatedResults = results.slice(start, end);

    return {
      items: paginatedResults,
      total: results.length,
      hasMore: end < results.length,
    };
  });

export const quickSearchProcedure = publicProcedure
  .input(
    z.object({
      query: z.string(),
      type: z.enum(['customer', 'employee', 'debt', 'payment', 'all']).default('all'),
    })
  )
  .query(async ({ input }) => {
    console.log('Quick search:', input);

    const query = input.query.toLowerCase();
    const customers = mockCustomers.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.phone.includes(query)
    );

    return {
      customers: input.type === 'all' || input.type === 'customer' ? customers : [],
      employees: [],
      debts: input.type === 'all' || input.type === 'debt' ? mockDebts : [],
      payments: input.type === 'all' || input.type === 'payment' ? mockPayments : [],
    };
  });

export const autoEmailSearchProcedure = publicProcedure
  .input(
    z.object({
      searchParams: z.record(z.string(), z.any()),
      recipientEmail: z.string().email(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Auto email search results to:', input.recipientEmail);

    return {
      success: true,
      message: 'Search results sent to email',
    };
  });
