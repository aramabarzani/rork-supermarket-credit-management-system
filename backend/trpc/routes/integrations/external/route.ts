import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const getIntegrationsProcedure = protectedProcedure.query(async () => {
  console.log("[Integrations] Fetching integrations");

  const integrations = [
    {
      id: "int_1",
      name: "AWS S3",
      type: "cloud_storage" as const,
      enabled: false,
      config: {},
      status: "disconnected" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "int_2",
      name: "WhatsApp Business",
      type: "whatsapp" as const,
      enabled: false,
      config: {},
      status: "disconnected" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    success: true,
    integrations,
  };
});

export const createIntegrationProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      type: z.enum([
        "cloud_storage",
        "local_server",
        "external_api",
        "bank",
        "sms",
        "email",
        "whatsapp",
        "telegram",
        "viber",
      ]),
      config: z.record(z.any()),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Integrations] Creating integration:", input.name);

    const integration = {
      id: `int_${Date.now()}`,
      ...input,
      enabled: false,
      status: "disconnected" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      integration,
      message: "پەیوەندی دروستکرا",
    };
  });

export const updateIntegrationProcedure = protectedProcedure
  .input(
    z.object({
      integrationId: z.string(),
      enabled: z.boolean().optional(),
      config: z.record(z.any()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Integrations] Updating integration:", input.integrationId);

    return {
      success: true,
      message: "پەیوەندی نوێکرایەوە",
    };
  });

export const testIntegrationProcedure = protectedProcedure
  .input(z.object({ integrationId: z.string() }))
  .mutation(async ({ input }) => {
    console.log("[Integrations] Testing integration:", input.integrationId);

    return {
      success: true,
      status: "connected" as const,
      message: "پەیوەندی بەسەرکەوتوویی تاقیکرایەوە",
    };
  });

export const deleteIntegrationProcedure = protectedProcedure
  .input(z.object({ integrationId: z.string() }))
  .mutation(async ({ input }) => {
    console.log("[Integrations] Deleting integration:", input.integrationId);

    return {
      success: true,
      message: "پەیوەندی سڕایەوە",
    };
  });

export const syncIntegrationProcedure = protectedProcedure
  .input(z.object({ integrationId: z.string() }))
  .mutation(async ({ input }) => {
    console.log("[Integrations] Syncing integration:", input.integrationId);

    return {
      success: true,
      lastSync: new Date().toISOString(),
      message: "پەیوەندی هاوکات کرا",
    };
  });
