import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../../create-context';
import type { License, LicenseValidation } from '@/types/license';

const mockLicenses: License[] = [];

function generateLicenseKey(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    const segment = Math.random().toString(36).substring(2, 8).toUpperCase();
    segments.push(segment);
  }
  return segments.join('-');
}

export const createLicenseProcedure = protectedProcedure
  .input(z.object({
    clientName: z.string(),
    type: z.enum(['trial', 'monthly', 'yearly', 'lifetime']),
    maxUsers: z.number(),
    maxCustomers: z.number(),
    features: z.array(z.string()),
    durationMonths: z.number().optional(),
  }))
  .mutation(async ({ input }): Promise<License> => {
    const now = new Date();
    let expiresAt: string | null = null;

    if (input.type === 'trial') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (input.type === 'monthly') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (input.type === 'yearly') {
      expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else if (input.durationMonths) {
      expiresAt = new Date(now.getTime() + input.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    const license: License = {
      id: `lic_${Date.now()}`,
      key: generateLicenseKey(),
      clientId: `client_${Date.now()}`,
      clientName: input.clientName,
      type: input.type,
      status: 'active',
      maxUsers: input.maxUsers,
      maxCustomers: input.maxCustomers,
      features: input.features,
      issuedAt: now.toISOString(),
      expiresAt,
      lastValidated: now.toISOString(),
    };

    mockLicenses.push(license);
    return license;
  });

export const validateLicenseProcedure = publicProcedure
  .input(z.object({
    key: z.string(),
    deviceId: z.string().optional(),
    ipAddress: z.string().optional(),
  }))
  .query(async ({ input }): Promise<LicenseValidation> => {
    const license = mockLicenses.find(l => l.key === input.key);

    if (!license) {
      return {
        isValid: false,
        message: 'لایسەنسی نادروست',
      };
    }

    if (license.status === 'suspended') {
      return {
        isValid: false,
        license,
        message: 'لایسەنسەکە ڕاگیراوە',
      };
    }

    if (license.expiresAt) {
      const expiryDate = new Date(license.expiresAt);
      const now = new Date();

      if (now > expiryDate) {
        license.status = 'expired';
        return {
          isValid: false,
          license,
          message: 'لایسەنسەکە بەسەرچووە',
        };
      }

      const remainingDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      license.lastValidated = now.toISOString();
      if (input.deviceId) license.deviceId = input.deviceId;
      if (input.ipAddress) license.ipAddress = input.ipAddress;

      return {
        isValid: true,
        license,
        message: 'لایسەنسی دروست',
        remainingDays,
      };
    }

    license.lastValidated = new Date().toISOString();
    if (input.deviceId) license.deviceId = input.deviceId;
    if (input.ipAddress) license.ipAddress = input.ipAddress;

    return {
      isValid: true,
      license,
      message: 'لایسەنسی دروست',
    };
  });

export const getAllLicensesProcedure = protectedProcedure
  .query(async (): Promise<License[]> => {
    return mockLicenses;
  });

export const updateLicenseStatusProcedure = protectedProcedure
  .input(z.object({
    licenseId: z.string(),
    status: z.enum(['active', 'expired', 'suspended', 'trial']),
  }))
  .mutation(async ({ input }): Promise<License> => {
    const license = mockLicenses.find(l => l.id === input.licenseId);
    if (!license) {
      throw new Error('لایسەنس نەدۆزرایەوە');
    }

    license.status = input.status;
    return license;
  });

export const renewLicenseProcedure = protectedProcedure
  .input(z.object({
    licenseId: z.string(),
    durationMonths: z.number(),
  }))
  .mutation(async ({ input }): Promise<License> => {
    const license = mockLicenses.find(l => l.id === input.licenseId);
    if (!license) {
      throw new Error('لایسەنس نەدۆزرایەوە');
    }

    const now = new Date();
    const currentExpiry = license.expiresAt ? new Date(license.expiresAt) : now;
    const newExpiry = new Date(Math.max(currentExpiry.getTime(), now.getTime()) + input.durationMonths * 30 * 24 * 60 * 60 * 1000);

    license.expiresAt = newExpiry.toISOString();
    license.status = 'active';

    return license;
  });
