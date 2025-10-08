import { protectedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { licenses } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const renewLicenseSchema = z.object({
  plan: z.enum(["free", "basic", "premium", "enterprise"]),
  duration: z.number().default(365),
});

export default protectedProcedure
  .input(renewLicenseSchema)
  .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "owner") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only owners can renew licenses",
      });
    }

    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.ownerId, ctx.user.ownerId))
      .limit(1);

    if (!license) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No license found",
      });
    }

    const planLimits = {
      free: { maxAdmins: 0, maxStaff: 2, maxCustomers: 50 },
      basic: { maxAdmins: 1, maxStaff: 5, maxCustomers: 200 },
      premium: { maxAdmins: 3, maxStaff: 15, maxCustomers: 1000 },
      enterprise: { maxAdmins: 10, maxStaff: 50, maxCustomers: 10000 },
    };

    const features = {
      free: ["basic_customers", "basic_transactions"],
      basic: ["basic_customers", "basic_transactions", "reports", "notifications"],
      premium: [
        "basic_customers",
        "basic_transactions",
        "reports",
        "notifications",
        "analytics",
        "advanced_reports",
        "whatsapp_integration",
      ],
      enterprise: [
        "basic_customers",
        "basic_transactions",
        "reports",
        "notifications",
        "analytics",
        "advanced_reports",
        "whatsapp_integration",
        "api_access",
        "custom_branding",
        "priority_support",
      ],
    };

    const limits = planLimits[input.plan];
    const now = new Date();
    const currentExpiry = new Date(license.expiryDate);
    const startDate = currentExpiry > now ? currentExpiry : now;
    const newExpiryDate = new Date(startDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + input.duration);

    await db
      .update(licenses)
      .set({
        plan: input.plan,
        status: "active",
        startDate: startDate,
        expiryDate: newExpiryDate,
        maxAdmins: limits.maxAdmins,
        maxStaff: limits.maxStaff,
        maxCustomers: limits.maxCustomers,
        features: JSON.stringify(features[input.plan]),
        updatedAt: now,
      })
      .where(eq(licenses.id, license.id));

    return {
      success: true,
      license: {
        plan: input.plan,
        status: "active",
        expiryDate: newExpiryDate.toISOString(),
        features: features[input.plan],
      },
    };
  });
