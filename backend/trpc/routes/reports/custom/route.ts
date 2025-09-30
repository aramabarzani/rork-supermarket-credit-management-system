import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const createCustomReportProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      description: z.string(),
      format: z.enum(["pdf", "excel", "csv", "json"]),
      fields: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.enum(["text", "number", "date", "boolean", "currency"]),
          source: z.enum(["customer", "debt", "payment", "employee", "system"]),
          enabled: z.boolean(),
        })
      ),
      filters: z.record(z.any()),
      schedule: z
        .object({
          enabled: z.boolean(),
          frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
          time: z.string(),
          recipients: z.array(z.string()),
        })
        .optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Custom Report] Creating custom report:", input.name);

    const report = {
      id: `report_${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: ctx.user?.id || "system",
    };

    return {
      success: true,
      report,
      message: "ڕاپۆرتی تایبەتی بەسەرکەوتوویی دروستکرا",
    };
  });

export const getCustomReportsProcedure = protectedProcedure.query(async () => {
  console.log("[Custom Report] Fetching custom reports");

  const mockReports = [
    {
      id: "report_1",
      name: "ڕاپۆرتی مانگانەی قەرز",
      description: "ڕاپۆرتی تەواوی قەرزەکانی مانگی ئێستا",
      format: "pdf" as const,
      fields: [],
      filters: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
    },
  ];

  return {
    success: true,
    reports: mockReports,
  };
});

export const generateCustomReportProcedure = protectedProcedure
  .input(z.object({ reportId: z.string() }))
  .mutation(async ({ input }) => {
    console.log("[Custom Report] Generating report:", input.reportId);

    return {
      success: true,
      reportUrl: `https://example.com/reports/${input.reportId}.pdf`,
      message: "ڕاپۆرت بەسەرکەوتوویی دروستکرا",
    };
  });

export const deleteCustomReportProcedure = protectedProcedure
  .input(z.object({ reportId: z.string() }))
  .mutation(async ({ input }) => {
    console.log("[Custom Report] Deleting report:", input.reportId);

    return {
      success: true,
      message: "ڕاپۆرت بەسەرکەوتوویی سڕایەوە",
    };
  });
