import { licensedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { customers } from "../../../../db/schema";
import { checkResourceLimit } from "../../../../utils/license";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const createCustomerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  address: z.string().optional(),
  nationalId: z.string().optional(),
  creditLimit: z.number().default(0),
  rating: z.string().optional(),
  group: z.string().optional(),
  notes: z.string().optional(),
});

export default licensedProcedure
  .input(createCustomerSchema)
  .mutation(async ({ ctx, input }) => {
    const existingCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.ownerId, ctx.user.ownerId));

    const limitCheck = await checkResourceLimit(
      ctx.user.ownerId,
      "customers",
      existingCustomers.length
    );

    if (!limitCheck.allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Customer limit reached (${limitCheck.limit}). Upgrade your plan.`,
        cause: { renewUrl: "/subscription-details" },
      });
    }

    const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    await db.insert(customers).values({
      id: customerId,
      ownerId: ctx.user.ownerId,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      address: input.address || null,
      nationalId: input.nationalId || null,
      creditLimit: input.creditLimit,
      currentDebt: 0,
      totalPaid: 0,
      rating: input.rating || null,
      group: input.group || null,
      notes: input.notes || null,
      isActive: true,
      isBlacklisted: false,
      createdBy: ctx.user.userId,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      customer: {
        id: customerId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        creditLimit: input.creditLimit,
        currentDebt: 0,
        totalPaid: 0,
      },
    };
  });
