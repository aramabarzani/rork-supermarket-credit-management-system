import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const mockQuickReports: any[] = [
  {
    id: '1',
    name: 'ڕاپۆرتی قەرزی ئەمڕۆ',
    type: 'debt' as const,
    description: 'هەموو قەرزەکانی ئەمڕۆ',
    data: {
      totalDebts: 15,
      totalAmount: 5000000,
      customers: 12,
    },
    generatedAt: new Date(),
    generatedBy: 'admin',
    format: 'pdf' as const,
  },
  {
    id: '2',
    name: 'ڕاپۆرتی پارەدانی ئەمڕۆ',
    type: 'payment' as const,
    description: 'هەموو پارەدانەکانی ئەمڕۆ',
    data: {
      totalPayments: 8,
      totalAmount: 2000000,
      customers: 7,
    },
    generatedAt: new Date(),
    generatedBy: 'admin',
    format: 'excel' as const,
  },
];

const mockTemplates: any[] = [
  {
    id: '1',
    name: 'ڕاپۆرتی ڕۆژانە',
    type: 'daily',
    fields: ['date', 'totalDebts', 'totalPayments', 'balance'],
    filters: { dateRange: 'today' },
    sortBy: 'date',
    sortOrder: 'desc' as const,
    isDefault: true,
  },
  {
    id: '2',
    name: 'ڕاپۆرتی مانگانە',
    type: 'monthly',
    fields: ['month', 'totalDebts', 'totalPayments', 'balance', 'customers'],
    filters: { dateRange: 'thisMonth' },
    sortBy: 'month',
    sortOrder: 'desc' as const,
    isDefault: false,
  },
];

export const getQuickReportsProcedure = publicProcedure.query(() => {
  return mockQuickReports;
});

export const generateQuickReportProcedure = publicProcedure
  .input(
    z.object({
      type: z.enum(['debt', 'payment', 'customer', 'employee', 'financial', 'system']),
      format: z.enum(['pdf', 'excel', 'json']),
      dateRange: z.string().optional(),
      filters: z.record(z.any()).optional(),
    })
  )
  .mutation(({ input }) => {
    const report = {
      id: Date.now().toString(),
      name: `ڕاپۆرتی ${input.type}`,
      type: input.type,
      description: `ڕاپۆرتی خێرا بۆ ${input.type}`,
      data: {
        total: 100,
        amount: 10000000,
      },
      generatedAt: new Date(),
      generatedBy: 'admin',
      format: input.format,
    };
    mockQuickReports.unshift(report);
    return report;
  });

export const getReportTemplatesProcedure = publicProcedure.query(() => {
  return mockTemplates;
});

export const createReportTemplateProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      type: z.string(),
      fields: z.array(z.string()),
      filters: z.record(z.any()),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      isDefault: z.boolean().optional(),
    })
  )
  .mutation(({ input }) => {
    const template = {
      id: Date.now().toString(),
      ...input,
      isDefault: input.isDefault ?? false,
    };
    mockTemplates.push(template);
    return template;
  });

export const exportReportProcedure = publicProcedure
  .input(
    z.object({
      reportId: z.string(),
      format: z.enum(['pdf', 'excel']),
    })
  )
  .mutation(({ input }) => {
    const report = mockQuickReports.find(r => r.id === input.reportId);
    return {
      success: true,
      downloadUrl: `https://example.com/reports/${input.reportId}.${input.format}`,
      report,
    };
  });

export const emailReportProcedure = publicProcedure
  .input(
    z.object({
      reportId: z.string(),
      email: z.string().email(),
    })
  )
  .mutation(({ input }) => {
    return {
      success: true,
      message: `ڕاپۆرت بە سەرکەوتوویی نێردرا بۆ ${input.email}`,
    };
  });
