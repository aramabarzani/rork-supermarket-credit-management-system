import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db";
import { owners, licenses } from "../../../../db/schema";
import { verifyPassword, generateToken } from "../../../../utils/auth";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const loginOwnerSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

export default publicProcedure
  .input(loginOwnerSchema)
  .mutation(async ({ input }) => {
    const [owner] = await db
      .select()
      .from(owners)
      .where(eq(owners.phone, input.phone))
      .limit(1);

    if (!owner) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid phone or password",
      });
    }

    const isValidPassword = await verifyPassword(input.password, owner.password);
    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid phone or password",
      });
    }

    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.ownerId, owner.id))
      .limit(1);

    if (!license) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No license found",
      });
    }

    const now = new Date();
    const expiryDate = new Date(license.expiryDate);

    if (expiryDate < now) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "License expired",
        cause: { renewUrl: "/subscription-details" },
      });
    }

    if (license.status === "suspended") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "License suspended",
        cause: { renewUrl: "/subscription-details" },
      });
    }

    const token = generateToken({
      userId: owner.id,
      ownerId: owner.id,
      role: "owner",
      email: owner.email,
    });

    return {
      success: true,
      token,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        storeName: owner.storeName,
        storeAddress: owner.storeAddress,
      },
      license: {
        plan: license.plan,
        status: license.status,
        expiryDate: license.expiryDate,
        features: JSON.parse(license.features),
      },
    };
  });
