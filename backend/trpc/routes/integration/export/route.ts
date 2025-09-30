import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const exportToExcelProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['debts', 'payments', 'customers', 'reports', 'dashboard']),
    data: z.any(),
    options: z.object({
      includeCharts: z.boolean().optional(),
      dateRange: z.object({
        start: z.string(),
        end: z.string(),
      }).optional(),
    }).optional(),
  }))
  .mutation(async ({ input }) => {
    const { type, data, options } = input;
    
    const csvData = convertToCSV(data, type);
    
    return {
      success: true,
      format: 'excel' as const,
      data: csvData,
      timestamp: new Date().toISOString(),
    };
  });

export const exportToPDFProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['report', 'receipt', 'dashboard', 'chart']),
    data: z.any(),
    options: z.object({
      includeCharts: z.boolean().optional(),
    }).optional(),
  }))
  .mutation(async ({ input }) => {
    const { type, data } = input;
    
    const pdfData = generatePDFData(data, type);
    
    return {
      success: true,
      format: 'pdf' as const,
      data: pdfData,
      timestamp: new Date().toISOString(),
    };
  });

export const exportDashboardProcedure = protectedProcedure
  .input(z.object({
    format: z.enum(['excel', 'pdf']),
    includeCharts: z.boolean().optional(),
  }))
  .mutation(async ({ input }) => {
    const { format, includeCharts } = input;
    
    const dashboardData = {
      summary: 'Dashboard data',
      charts: includeCharts ? ['chart1', 'chart2'] : [],
      timestamp: new Date().toISOString(),
    };
    
    return {
      success: true,
      format,
      data: format === 'excel' ? convertToCSV(dashboardData, 'dashboard') : generatePDFData(dashboardData, 'dashboard'),
      timestamp: new Date().toISOString(),
    };
  });

export const exportChartProcedure = protectedProcedure
  .input(z.object({
    chartId: z.string(),
    format: z.enum(['excel', 'pdf', 'png']),
    data: z.any(),
  }))
  .mutation(async ({ input }) => {
    const { chartId, format, data } = input;
    
    return {
      success: true,
      format,
      data: format === 'excel' ? convertToCSV(data, 'chart') : generatePDFData(data, 'chart'),
      chartId,
      timestamp: new Date().toISOString(),
    };
  });

function convertToCSV(data: any, type: string): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
  
  return JSON.stringify(data);
}

function generatePDFData(data: any, type: string): string {
  return `PDF_DATA_${type}_${JSON.stringify(data)}`;
}
