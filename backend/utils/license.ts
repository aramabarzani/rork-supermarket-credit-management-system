import { db } from "../db";
import { licenses } from "../db/schema";
import { eq } from "drizzle-orm";

export interface LicenseValidationResult {
  isValid: boolean;
  license?: typeof licenses.$inferSelect;
  error?: string;
  renewUrl?: string;
}

export async function validateLicense(
  ownerId: string
): Promise<LicenseValidationResult> {
  try {
    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.ownerId, ownerId))
      .limit(1);

    if (!license) {
      return {
        isValid: false,
        error: "No license found",
        renewUrl: "/subscription-details",
      };
    }

    if (license.status === "suspended") {
      return {
        isValid: false,
        error: "License suspended",
        renewUrl: "/subscription-details",
      };
    }

    const now = new Date();
    const expiryDate = new Date(license.expiryDate);

    if (expiryDate < now) {
      await db
        .update(licenses)
        .set({ status: "expired", updatedAt: now })
        .where(eq(licenses.id, license.id));

      return {
        isValid: false,
        error: "License expired",
        renewUrl: "/subscription-details",
      };
    }

    return {
      isValid: true,
      license,
    };
  } catch (error) {
    console.error("License validation error:", error);
    return {
      isValid: false,
      error: "License validation failed",
    };
  }
}

export async function checkFeatureAccess(
  ownerId: string,
  feature: string
): Promise<boolean> {
  const validation = await validateLicense(ownerId);
  
  if (!validation.isValid || !validation.license) {
    return false;
  }

  const features = JSON.parse(validation.license.features) as string[];
  return features.includes(feature);
}

export async function checkResourceLimit(
  ownerId: string,
  resource: "admins" | "staff" | "customers",
  currentCount: number
): Promise<{ allowed: boolean; limit: number }> {
  const validation = await validateLicense(ownerId);
  
  if (!validation.isValid || !validation.license) {
    return { allowed: false, limit: 0 };
  }

  let limit = 0;
  switch (resource) {
    case "admins":
      limit = validation.license.maxAdmins;
      break;
    case "staff":
      limit = validation.license.maxStaff;
      break;
    case "customers":
      limit = validation.license.maxCustomers;
      break;
  }

  return {
    allowed: currentCount < limit,
    limit,
  };
}
