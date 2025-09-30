import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import type { CustomReport } from "@/types/monitoring";

const mockCustomReports: CustomReport[] = [
  {
    id: '1',
    name: 'ڕاپۆرتی مانگانەی بەڕێوەبەر',
    description: 'ڕاپۆرتی تەواوی چالاکیەکانی مانگی ڕابردوو',
    type: 'admin',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin',
    data: {
      totalDebts: 15000000,
      totalPayments: 12000000,
      newCustomers: 25,
      activeEmployees: 8,
    },
  },
  {
    id: '2',
    name: 'ڕاپۆرتی کارمەند',
    description: 'ڕاپۆرتی چالاکیەکانی کارمەند',
    type: 'employee',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'employee-1',
    data: {
      debtsAdded: 5,
      paymentsReceived: 12,
      customersServed: 18,
    },
  },
  {
    id: '3',
    name: 'ڕاپۆرتی کڕیار',
    description: 'ڕاپۆرتی قەرز و پارەدانەکانی کڕیار',
    type: 'customer',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'customer-1',
    data: {
      totalDebt: 500000,
      totalPaid: 300000,
      remainingDebt: 200000,
      paymentHistory: 8,
    },
  },
];

export const getCustomReportsProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['admin', 'employee', 'customer']).optional(),
    limit: z.number().optional().default(50),
  }))
  .query(async ({ input }) => {
    let filtered = [...mockCustomReports];

    if (input.type) {
      filtered = filtered.filter(r => r.type === input.type);
    }

    return filtered.slice(0, input.limit);
  });

export const getCustomReportByIdProcedure = protectedProcedure
  .input(z.object({
    reportId: z.string(),
  }))
  .query(async ({ input }) => {
    const report = mockCustomReports.find(r => r.id === input.reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }

    return report;
  });

export const generateAdminReportProcedure = protectedProcedure
  .input(z.object({
    name: z.string(),
    description: z.string(),
    filters: z.record(z.string(), z.any()).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const report: CustomReport = {
      id: `report_${Date.now()}`,
      name: input.name,
      description: input.description,
      type: 'admin',
      createdAt: new Date().toISOString(),
      createdBy: ctx.user?.id || 'unknown',
      filters: input.filters,
      data: {
        totalDebts: Math.floor(Math.random() * 50000000) + 10000000,
        totalPayments: Math.floor(Math.random() * 40000000) + 8000000,
        newCustomers: Math.floor(Math.random() * 50) + 10,
        activeEmployees: Math.floor(Math.random() * 20) + 5,
        generatedAt: new Date().toISOString(),
      },
    };

    mockCustomReports.unshift(report);

    return { success: true, report };
  });

export const generateEmployeeReportProcedure = protectedProcedure
  .input(z.object({
    name: z.string(),
    description: z.string(),
    employeeId: z.string(),
    filters: z.record(z.string(), z.any()).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const report: CustomReport = {
      id: `report_${Date.now()}`,
      name: input.name,
      description: input.description,
      type: 'employee',
      createdAt: new Date().toISOString(),
      createdBy: ctx.user?.id || 'unknown',
      filters: input.filters,
      data: {
        employeeId: input.employeeId,
        debtsAdded: Math.floor(Math.random() * 20) + 1,
        paymentsReceived: Math.floor(Math.random() * 30) + 5,
        customersServed: Math.floor(Math.random() * 40) + 10,
        generatedAt: new Date().toISOString(),
      },
    };

    mockCustomReports.unshift(report);

    return { success: true, report };
  });

export const generateCustomerReportProcedure = protectedProcedure
  .input(z.object({
    name: z.string(),
    description: z.string(),
    customerId: z.string(),
    filters: z.record(z.string(), z.any()).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const report: CustomReport = {
      id: `report_${Date.now()}`,
      name: input.name,
      description: input.description,
      type: 'customer',
      createdAt: new Date().toISOString(),
      createdBy: ctx.user?.id || 'unknown',
      filters: input.filters,
      data: {
        customerId: input.customerId,
        totalDebt: Math.floor(Math.random() * 2000000) + 100000,
        totalPaid: Math.floor(Math.random() * 1500000) + 50000,
        remainingDebt: Math.floor(Math.random() * 500000),
        paymentHistory: Math.floor(Math.random() * 20) + 1,
        generatedAt: new Date().toISOString(),
      },
    };

    mockCustomReports.unshift(report);

    return { success: true, report };
  });

export const deleteCustomReportProcedure = protectedProcedure
  .input(z.object({
    reportId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const index = mockCustomReports.findIndex(r => r.id === input.reportId);
    
    if (index !== -1) {
      mockCustomReports.splice(index, 1);
      return { success: true };
    }

    return { success: false, error: 'Report not found' };
  });
