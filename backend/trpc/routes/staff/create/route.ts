import { licensedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { staff } from "../../../../db/schema";
import { hashPassword } from "../../../../utils/auth";
import { checkResourceLimit } from "../../../../utils/license";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const createStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.string(),
  permissions: z.array(z.string()),
});

export default licensedProcedure
  .input(createStaffSchema)
  .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "owner" && ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only owners and admins can create staff",
      });
    }

    const existingStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.ownerId, ctx.user.ownerId));

    const limitCheck = await checkResourceLimit(
      ctx.user.ownerId,
      "staff",
      existingStaff.length
    );

    if (!limitCheck.allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Staff limit reached (${limitCheck.limit}). Upgrade your plan.`,
        cause: { renewUrl: "/subscription-details" },
      });
    }

    const [existingStaffMember] = await db
      .select()
      .from(staff)
      .where(eq(staff.email, input.email))
      .limit(1);

    if (existingStaffMember) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already registered",
      });
    }

    const hashedPassword = await hashPassword(input.password);
    const staffId = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    await db.insert(staff).values({
      id: staffId,
      ownerId: ctx.user.ownerId,
      adminId: ctx.user.role === "admin" ? ctx.user.userId : null,
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      role: input.role,
      permissions: JSON.stringify(input.permissions),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      staff: {
        id: staffId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        role: input.role,
        permissions: input.permissions,
        isActive: true,
      },
    };
  });
