import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const printReportProcedure = protectedProcedure
  .input(
    z.object({
      reportId: z.string(),
      templateId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Printing] Printing report:", input.reportId);

    return {
      success: true,
      jobId: `print_${Date.now()}`,
      message: "ڕاپۆرت بۆ چاپکردن نێردرا",
    };
  });

export const printReceiptProcedure = protectedProcedure
  .input(
    z.object({
      receiptId: z.string(),
      templateId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Printing] Printing receipt:", input.receiptId);

    return {
      success: true,
      jobId: `print_${Date.now()}`,
      message: "وەسڵ بۆ چاپکردن نێردرا",
    };
  });

export const printCustomerCardProcedure = protectedProcedure
  .input(z.object({ customerId: z.string() }))
  .mutation(async ({ input }) => {
    console.log("[Printing] Printing customer card:", input.customerId);

    return {
      success: true,
      jobId: `print_${Date.now()}`,
      message: "کارتی کڕیار بۆ چاپکردن نێردرا",
    };
  });

export const printEmployeeCardProcedure = protectedProcedure
  .input(z.object({ employeeId: z.string() }))
  .mutation(async ({ input }) => {
    console.log("[Printing] Printing employee card:", input.employeeId);

    return {
      success: true,
      jobId: `print_${Date.now()}`,
      message: "کارتی کارمەند بۆ چاپکردن نێردرا",
    };
  });

export const printManagerCardProcedure = protectedProcedure
  .input(z.object({ managerId: z.string() }))
  .mutation(async ({ input }) => {
    console.log("[Printing] Printing manager card:", input.managerId);

    return {
      success: true,
      jobId: `print_${Date.now()}`,
      message: "کارتی بەڕێوەبەر بۆ چاپکردن نێردرا",
    };
  });

export const getPrintTemplatesProcedure = protectedProcedure.query(async () => {
  console.log("[Printing] Fetching print templates");

  const templates = [
    {
      id: "template_1",
      name: "تێمپلەیتی وەسڵی ستاندارد",
      type: "receipt" as const,
      template: "<html>...</html>",
      settings: {
        paperSize: "thermal" as const,
        orientation: "portrait" as const,
        margins: { top: 10, right: 10, bottom: 10, left: 10 },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    success: true,
    templates,
  };
});

export const createPrintTemplateProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      type: z.enum(["receipt", "customer_card", "employee_card", "manager_card", "report"]),
      template: z.string(),
      settings: z.object({
        paperSize: z.enum(["A4", "A5", "letter", "thermal"]),
        orientation: z.enum(["portrait", "landscape"]),
        margins: z.object({
          top: z.number(),
          right: z.number(),
          bottom: z.number(),
          left: z.number(),
        }),
        header: z.string().optional(),
        footer: z.string().optional(),
      }),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Printing] Creating print template:", input.name);

    const template = {
      id: `template_${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      template,
      message: "تێمپلەیتی چاپکردن دروستکرا",
    };
  });

export const getPrintJobsProcedure = protectedProcedure.query(async () => {
  console.log("[Printing] Fetching print jobs");

  return {
    success: true,
    jobs: [],
  };
});
