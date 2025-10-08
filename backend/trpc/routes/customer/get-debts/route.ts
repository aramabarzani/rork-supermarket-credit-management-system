import { licensedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { transactions, customers } from "../../../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const getCustomerDebtsSchema = z.object({
  customerId: z.string(),
});

export default licensedProcedure
  .input(getCustomerDebtsSchema)
  .query(async ({ ctx, input }) => {
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

    const debts = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.customerId, input.customerId),
          eq(transactions.ownerId, ctx.user.ownerId),
          eq(transactions.type, "debt")
        )
      )
      .orderBy(desc(transactions.createdAt));

    const payments = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.customerId, input.customerId),
          eq(transactions.ownerId, ctx.user.ownerId),
          eq(transactions.type, "payment")
        )
      )
      .orderBy(desc(transactions.createdAt));

    const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const currentDebt = totalDebt - totalPaid;

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        creditLimit: customer.creditLimit,
      },
      debts: debts.map((d) => ({
        id: d.id,
        amount: d.amount,
        description: d.description,
        category: d.category,
        status: d.status,
        dueDate: d.dueDate,
        createdAt: d.createdAt,
      })),
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        description: p.description,
        paymentMethod: p.paymentMethod,
        paidDate: p.paidDate,
        createdAt: p.createdAt,
      })),
      summary: {
        totalDebt,
        totalPaid,
        currentDebt,
        creditLimit: customer.creditLimit,
        availableCredit: customer.creditLimit - currentDebt,
      },
    };
  });
