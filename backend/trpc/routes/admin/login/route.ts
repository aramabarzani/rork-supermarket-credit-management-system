import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { admins, licenses } from "../../../../db/schema";
import { verifyPassword, generateToken } from "../../../../utils/auth";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const loginAdminSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default publicProcedure
  .input(loginAdminSchema)
  .mutation(async ({ input }) => {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, input.email))
      .limit(1);

    if (!admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    if (!admin.isActive) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Account is inactive",
      });
    }

    const isValidPassword = await verifyPassword(input.password, admin.password);
    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.ownerId, admin.ownerId))
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
      userId: admin.id,
      ownerId: admin.ownerId,
      role: "admin",
      email: admin.email,
    });

    return {
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        permissions: JSON.parse(admin.permissions),
      },
    };
  });
