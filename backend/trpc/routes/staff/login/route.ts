import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { staff, licenses } from "../../../../db/schema";
import { verifyPassword, generateToken } from "../../../../utils/auth";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const loginStaffSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default publicProcedure
  .input(loginStaffSchema)
  .mutation(async ({ input }) => {
    const [staffMember] = await db
      .select()
      .from(staff)
      .where(eq(staff.email, input.email))
      .limit(1);

    if (!staffMember) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    if (!staffMember.isActive) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Account is inactive",
      });
    }

    const isValidPassword = await verifyPassword(input.password, staffMember.password);
    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.ownerId, staffMember.ownerId))
      .limit(1);

    if (!license) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No license found",
      });
    }

    const now = new Date();
    const expiryDate = new Date(license.expiryDate);

    if (expiryDate < now || license.status !== "active") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "License expired",
        cause: { renewUrl: "/subscription-details" },
      });
    }

    const token = generateToken({
      userId: staffMember.id,
      ownerId: staffMember.ownerId,
      role: "staff",
      email: staffMember.email,
    });

    return {
      success: true,
      token,
      staff: {
        id: staffMember.id,
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        role: staffMember.role,
        permissions: JSON.parse(staffMember.permissions),
      },
    };
  });
