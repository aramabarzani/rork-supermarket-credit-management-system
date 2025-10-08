import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { licenses } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export default protectedProcedure.query(async ({ ctx }) => {
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

  const now = new Date();
  const expiryDate = new Date(license.expiryDate);
  const daysRemaining = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    license: {
      id: license.id,
      plan: license.plan,
      status: license.status,
      startDate: license.startDate,
      expiryDate: license.expiryDate,
      daysRemaining,
      isExpired: expiryDate < now,
      maxAdmins: license.maxAdmins,
      maxStaff: license.maxStaff,
      maxCustomers: license.maxCustomers,
      features: JSON.parse(license.features),
      autoRenew: license.autoRenew,
    },
  };
});
