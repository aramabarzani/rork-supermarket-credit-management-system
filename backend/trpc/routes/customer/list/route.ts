import { licensedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { customers } from "../../../../db/schema";
import { eq, like, or, and, desc } from "drizzle-orm";

const listCustomersSchema = z.object({
  search: z.string().optional(),
  group: z.string().optional(),
  isActive: z.boolean().optional(),
  isBlacklisted: z.boolean().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

export default licensedProcedure
  .input(listCustomersSchema)
  .query(async ({ ctx, input }) => {
    const conditions = [eq(customers.ownerId, ctx.user.ownerId)];

    if (input.search) {
      conditions.push(
        or(
          like(customers.name, `%${input.search}%`),
          like(customers.phone, `%${input.search}%`),
          like(customers.email, `%${input.search}%`)
        )!
      );
    }

    if (input.group) {
      conditions.push(eq(customers.group, input.group));
    }

    if (input.isActive !== undefined) {
      conditions.push(eq(customers.isActive, input.isActive));
    }

    if (input.isBlacklisted !== undefined) {
      conditions.push(eq(customers.isBlacklisted, input.isBlacklisted));
    }

    const customerList = await db
      .select()
      .from(customers)
      .where(and(...conditions))
      .orderBy(desc(customers.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    return {
      customers: customerList.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        creditLimit: c.creditLimit,
        currentDebt: c.currentDebt,
        totalPaid: c.totalPaid,
        rating: c.rating,
        group: c.group,
        isActive: c.isActive,
        isBlacklisted: c.isBlacklisted,
        createdAt: c.createdAt,
      })),
      total: customerList.length,
    };
  });
