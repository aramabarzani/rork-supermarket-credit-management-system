import { licensedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { transactions, customers } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const createTransactionSchema = z.object({
  customerId: z.string(),
  type: z.enum(["debt", "payment"]),
  amount: z.number().positive(),
  description: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["pending", "completed", "overdue", "cancelled"]).default("pending"),
});

export default licensedProcedure
  .input(createTransactionSchema)
  .mutation(async ({ ctx, input }) => {
    const [customer] = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.id, input.customerId),
          eq(customers.ownerId, ctx.user.ownerId)
        )
      )
      .limit(1);

    if (!customer) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Customer not found",
      });
    }

    if (customer.isBlacklisted) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Customer is blacklisted",
      });
    }

    if (input.type === "debt") {
      const newDebt = customer.currentDebt + input.amount;
      if (newDebt > customer.creditLimit) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Credit limit exceeded. Available: ${customer.creditLimit - customer.currentDebt}`,
        });
      }
    }

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const receiptNumber = `RCP-${Date.now()}`;

    await db.insert(transactions).values({
      id: transactionId,
      ownerId: ctx.user.ownerId,
      customerId: input.customerId,
      type: input.type,
      amount: input.amount,
      description: input.description || null,
      category: input.category || null,
      paymentMethod: input.paymentMethod || null,
      receiptNumber,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      paidDate: input.type === "payment" ? now : null,
      status: input.status,
      createdBy: ctx.user.userId,
      createdAt: now,
      updatedAt: now,
    });

    const newCurrentDebt =
      input.type === "debt"
        ? customer.currentDebt + input.amount
        : customer.currentDebt - input.amount;

    const newTotalPaid =
      input.type === "payment"
        ? customer.totalPaid + input.amount
        : customer.totalPaid;

    await db
      .update(customers)
      .set({
        currentDebt: Math.max(0, newCurrentDebt),
        totalPaid: newTotalPaid,
        updatedAt: now,
      })
      .where(eq(customers.id, input.customerId));

    return {
      success: true,
      transaction: {
        id: transactionId,
        type: input.type,
        amount: input.amount,
        receiptNumber,
        status: input.status,
        createdAt: now,
      },
      customer: {
        currentDebt: Math.max(0, newCurrentDebt),
        totalPaid: newTotalPaid,
        availableCredit: customer.creditLimit - Math.max(0, newCurrentDebt),
      },
    };
  });
