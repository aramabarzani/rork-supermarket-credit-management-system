import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { owners, licenses } from "../../../../db/schema";
import { hashPassword, generateToken } from "../../../../utils/auth";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const registerOwnerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  storeName: z.string().min(2),
  storeAddress: z.string().optional(),
  plan: z.enum(["free", "basic", "premium", "enterprise"]).default("free"),
});

export default publicProcedure
  .input(registerOwnerSchema)
  .mutation(async ({ input }) => {
    const existingOwner = await db
      .select()
      .from(owners)
      .where(eq(owners.email, input.email))
      .limit(1);

    if (existingOwner.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already registered",
      });
    }

    const hashedPassword = await hashPassword(input.password);
    const ownerId = `owner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const planLimits = {
      free: { maxAdmins: 0, maxStaff: 2, maxCustomers: 50, days: 30 },
      basic: { maxAdmins: 1, maxStaff: 5, maxCustomers: 200, days: 365 },
      premium: { maxAdmins: 3, maxStaff: 15, maxCustomers: 1000, days: 365 },
      enterprise: { maxAdmins: 10, maxStaff: 50, maxCustomers: 10000, days: 365 },
    };

    const limits = planLimits[input.plan];
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + limits.days);

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

    await db.insert(owners).values({
      id: ownerId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      storeName: input.storeName,
      storeAddress: input.storeAddress || null,
      createdAt: now,
      updatedAt: now,
    });

    const licenseId = `license_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(licenses).values({
      id: licenseId,
      ownerId,
      plan: input.plan,
      status: "active",
      startDate: now,
      expiryDate,
      maxAdmins: limits.maxAdmins,
      maxStaff: limits.maxStaff,
      maxCustomers: limits.maxCustomers,
      features: JSON.stringify(features[input.plan]),
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
    });

    const token = generateToken({
      userId: ownerId,
      ownerId,
      role: "owner",
      email: input.email,
    });

    return {
      success: true,
      token,
      owner: {
        id: ownerId,
        name: input.name,
        email: input.email,
        storeName: input.storeName,
      },
      license: {
        plan: input.plan,
        expiryDate: expiryDate.toISOString(),
      },
    };
  });
