import { licensedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { admins } from "../../../../db/schema";
import { hashPassword } from "../../../../utils/auth";
import { checkResourceLimit } from "../../../../utils/license";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const createAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  permissions: z.array(z.string()),
});

export default licensedProcedure
  .input(createAdminSchema)
  .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "owner") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only owners can create admins",
      });
    }

    const existingAdmins = await db
      .select()
      .from(admins)
      .where(eq(admins.ownerId, ctx.user.ownerId));

    const limitCheck = await checkResourceLimit(
      ctx.user.ownerId,
      "admins",
      existingAdmins.length
    );

    if (!limitCheck.allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Admin limit reached (${limitCheck.limit}). Upgrade your plan.`,
        cause: { renewUrl: "/subscription-details" },
      });
    }

    const [existingAdmin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, input.email))
      .limit(1);

    if (existingAdmin) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already registered",
      });
    }

    const hashedPassword = await hashPassword(input.password);
    const adminId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    await db.insert(admins).values({
      id: adminId,
      ownerId: ctx.user.ownerId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      permissions: JSON.stringify(input.permissions),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      admin: {
        id: adminId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        permissions: input.permissions,
        isActive: true,
      },
    };
  });
