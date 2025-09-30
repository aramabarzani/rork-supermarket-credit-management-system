import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import type { License, LicenseValidationResponse } from '../../../../../types/license';

const mockLicenses: License[] = [];

function generateLicenseKey(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    const segment = Math.random().toString(36).substring(2, 8).toUpperCase();
    segments.push(segment);
  }
  return segments.join('-');
}

export const generateLicenseProcedure = publicProcedure
  .input(
    z.object({
      customerName: z.string(),
      customerEmail: z.string().email(),
      customerPhone: z.string(),
      type: z.enum(['trial', 'basic', 'professional', 'enterprise', 'lifetime']),
      durationDays: z.number(),
      maxEmployees: z.number(),
      maxCustomers: z.number(),
      maxBranches: z.number(),
      features: z.array(z.string()),
    })
  )
  .mutation(async ({ input }) => {
    const licenseKey = generateLicenseKey();
    const now = new Date();
    const expiryDate = new Date(now.getTime() + input.durationDays * 24 * 60 * 60 * 1000);

    const license: License = {
      id: `lic_${Date.now()}`,
      licenseKey,
      customerId: `cust_${Date.now()}`,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      type: input.type,
      status: 'pending',
      features: input.features,
      maxEmployees: input.maxEmployees,
      maxCustomers: input.maxCustomers,
      maxBranches: input.maxBranches,
      issueDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    mockLicenses.push(license);

    console.log('License generated:', license);

    return {
      success: true,
      license,
      message: 'License generated successfully',
    };
  });

export const validateLicenseProcedure = publicProcedure
  .input(
    z.object({
      licenseKey: z.string(),
      deviceId: z.string(),
      ipAddress: z.string().optional(),
      location: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
    })
  )
  .mutation(async ({ input }): Promise<LicenseValidationResponse> => {
    const license = mockLicenses.find((l) => l.licenseKey === input.licenseKey);

    if (!license) {
      return {
        valid: false,
        message: 'Invalid license key',
      };
    }

    if (license.status === 'suspended') {
      return {
        valid: false,
        license,
        message: 'License is suspended',
      };
    }

    if (license.status === 'inactive') {
      return {
        valid: false,
        license,
        message: 'License is inactive',
      };
    }

    const now = new Date();
    const expiryDate = new Date(license.expiryDate);

    if (now > expiryDate) {
      license.status = 'expired';
      return {
        valid: false,
        license,
        message: 'License has expired',
      };
    }

    const remainingDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    license.lastValidationDate = now.toISOString();
    license.deviceId = input.deviceId;
    license.ipAddress = input.ipAddress;
    if (input.location) {
      license.location = {
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        address: 'Unknown',
      };
    }

    console.log('License validated:', license);

    return {
      valid: true,
      license,
      message: 'License is valid',
      remainingDays,
    };
  });

export const activateLicenseProcedure = publicProcedure
  .input(
    z.object({
      licenseKey: z.string(),
      deviceId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const license = mockLicenses.find((l) => l.licenseKey === input.licenseKey);

    if (!license) {
      return {
        success: false,
        message: 'License not found',
      };
    }

    if (license.status === 'active') {
      return {
        success: false,
        message: 'License is already active',
      };
    }

    license.status = 'active';
    license.activationDate = new Date().toISOString();
    license.deviceId = input.deviceId;
    license.updatedAt = new Date().toISOString();

    console.log('License activated:', license);

    return {
      success: true,
      license,
      message: 'License activated successfully',
    };
  });

export const deactivateLicenseProcedure = publicProcedure
  .input(
    z.object({
      licenseKey: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const license = mockLicenses.find((l) => l.licenseKey === input.licenseKey);

    if (!license) {
      return {
        success: false,
        message: 'License not found',
      };
    }

    license.status = 'inactive';
    license.updatedAt = new Date().toISOString();

    console.log('License deactivated:', license);

    return {
      success: true,
      license,
      message: 'License deactivated successfully',
    };
  });

export const suspendLicenseProcedure = publicProcedure
  .input(
    z.object({
      licenseKey: z.string(),
      reason: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const license = mockLicenses.find((l) => l.licenseKey === input.licenseKey);

    if (!license) {
      return {
        success: false,
        message: 'License not found',
      };
    }

    license.status = 'suspended';
    license.updatedAt = new Date().toISOString();
    if (input.reason) {
      license.metadata = { ...license.metadata, suspensionReason: input.reason };
    }

    console.log('License suspended:', license);

    return {
      success: true,
      license,
      message: 'License suspended successfully',
    };
  });

export const getAllLicensesProcedure = publicProcedure.query(async () => {
  return {
    licenses: mockLicenses,
    total: mockLicenses.length,
  };
});

export const getLicenseByKeyProcedure = publicProcedure
  .input(
    z.object({
      licenseKey: z.string(),
    })
  )
  .query(async ({ input }) => {
    const license = mockLicenses.find((l) => l.licenseKey === input.licenseKey);

    if (!license) {
      return {
        success: false,
        message: 'License not found',
      };
    }

    return {
      success: true,
      license,
    };
  });

export const updateLicenseProcedure = publicProcedure
  .input(
    z.object({
      licenseKey: z.string(),
      maxEmployees: z.number().optional(),
      maxCustomers: z.number().optional(),
      maxBranches: z.number().optional(),
      features: z.array(z.string()).optional(),
      expiryDate: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const license = mockLicenses.find((l) => l.licenseKey === input.licenseKey);

    if (!license) {
      return {
        success: false,
        message: 'License not found',
      };
    }

    if (input.maxEmployees !== undefined) license.maxEmployees = input.maxEmployees;
    if (input.maxCustomers !== undefined) license.maxCustomers = input.maxCustomers;
    if (input.maxBranches !== undefined) license.maxBranches = input.maxBranches;
    if (input.features !== undefined) license.features = input.features;
    if (input.expiryDate !== undefined) license.expiryDate = input.expiryDate;

    license.updatedAt = new Date().toISOString();

    console.log('License updated:', license);

    return {
      success: true,
      license,
      message: 'License updated successfully',
    };
  });
