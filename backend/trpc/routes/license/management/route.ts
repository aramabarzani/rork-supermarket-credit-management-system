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
    businessName: z.string(),
    businessType: z.enum(['supermarket', 'grocery', 'retail', 'wholesale', 'other']),
    type: z.enum(['trial', 'monthly', 'yearly', 'lifetime']),
    maxUsers: z.number(),
    maxCustomers: z.number(),
    maxBranches: z.number(),
    features: z.array(z.string()),
    durationMonths: z.number().optional(),
    contactPerson: z.string(),
    contactPhone: z.string(),
    contactEmail: z.string(),
    address: z.string().optional(),
    city: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }): Promise<License> => {
    if (ctx.user?.role !== 'admin' || ctx.user?.id !== 'admin') {
      throw new Error('تەنیا خاوەندار دەتوانێت لایسەنس دروست بکات');
    }
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
      businessName: input.businessName,
      businessType: input.businessType,
      type: input.type,
      status: 'active',
      maxUsers: input.maxUsers,
      maxCustomers: input.maxCustomers,
      maxBranches: input.maxBranches,
      features: input.features,
      issuedAt: now.toISOString(),
      expiresAt,
      lastValidated: now.toISOString(),
      contactPerson: input.contactPerson,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      address: input.address,
      city: input.city,
      activationCount: 0,
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
  .mutation(async ({ input, ctx }): Promise<License> => {
    if (ctx.user?.role !== 'admin' || ctx.user?.id !== 'admin') {
      throw new Error('تەنیا خاوەندار دەتوانێت دۆخی لایسەنس بگۆڕێت');
    }
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
  .mutation(async ({ input, ctx }): Promise<License> => {
    if (ctx.user?.role !== 'admin' || ctx.user?.id !== 'admin') {
      throw new Error('تەنیا خاوەندار دەتوانێت لایسەنس نوێ بکاتەوە');
    }
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

export const activateLicenseProcedure = protectedProcedure
  .input(z.object({
    key: z.string(),
    hardwareId: z.string(),
    deviceId: z.string().optional(),
    ipAddress: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }): Promise<License> => {
    if (ctx.user?.role !== 'admin' || ctx.user?.id !== 'admin') {
      throw new Error('تەنیا خاوەندار دەتوانێت لایسەنس چالاک بکات');
    }
    const license = mockLicenses.find(l => l.key === input.key);
    if (!license) {
      throw new Error('لایسەنسی نادروست');
    }

    if (license.status === 'suspended') {
      throw new Error('لایسەنسەکە ڕاگیراوە');
    }

    if (license.expiresAt) {
      const expiryDate = new Date(license.expiresAt);
      const now = new Date();
      if (now > expiryDate) {
        license.status = 'expired';
        throw new Error('لایسەنسەکە بەسەرچووە');
      }
    }

    if (license.hardwareId && license.hardwareId !== input.hardwareId) {
      throw new Error('لایسەنسەکە لەسەر ئامێری تر چالاککراوە');
    }

    license.hardwareId = input.hardwareId;
    license.deviceId = input.deviceId;
    license.ipAddress = input.ipAddress;
    license.activationCount += 1;
    license.lastActivationAt = new Date().toISOString();
    license.lastValidated = new Date().toISOString();

    return license;
  });

export const deactivateLicenseProcedure = protectedProcedure
  .input(z.object({
    licenseId: z.string(),
  }))
  .mutation(async ({ input, ctx }): Promise<License> => {
    if (ctx.user?.role !== 'admin' || ctx.user?.id !== 'admin') {
      throw new Error('تەنیا خاوەندار دەتوانێت لایسەنس ناچالاک بکات');
    }
    const license = mockLicenses.find(l => l.id === input.licenseId);
    if (!license) {
      throw new Error('لایسەنس نەدۆزرایەوە');
    }

    license.hardwareId = undefined;
    license.deviceId = undefined;
    license.ipAddress = undefined;

    return license;
  });

export const transferLicenseProcedure = protectedProcedure
  .input(z.object({
    licenseId: z.string(),
    newHardwareId: z.string(),
  }))
  .mutation(async ({ input, ctx }): Promise<License> => {
    if (ctx.user?.role !== 'admin' || ctx.user?.id !== 'admin') {
      throw new Error('تەنیا خاوەندار دەتوانێت لایسەنس بگوازێتەوە');
    }
    const license = mockLicenses.find(l => l.id === input.licenseId);
    if (!license) {
      throw new Error('لایسەنس نەدۆزرایەوە');
    }

    license.hardwareId = input.newHardwareId;
    license.lastActivationAt = new Date().toISOString();

    return license;
  });

export const getLicenseStatsProcedure = protectedProcedure
  .query(async () => {
    const total = mockLicenses.length;
    const active = mockLicenses.filter(l => l.status === 'active').length;
    const trial = mockLicenses.filter(l => l.status === 'trial').length;
    const expired = mockLicenses.filter(l => l.status === 'expired').length;
    const suspended = mockLicenses.filter(l => l.status === 'suspended').length;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = mockLicenses.filter(l => {
      if (!l.expiresAt) return false;
      const expiryDate = new Date(l.expiresAt);
      return expiryDate <= thirtyDaysFromNow && expiryDate > now;
    }).length;

    const byBusinessType = {
      supermarket: mockLicenses.filter(l => l.businessType === 'supermarket').length,
      grocery: mockLicenses.filter(l => l.businessType === 'grocery').length,
      retail: mockLicenses.filter(l => l.businessType === 'retail').length,
      wholesale: mockLicenses.filter(l => l.businessType === 'wholesale').length,
      other: mockLicenses.filter(l => l.businessType === 'other').length,
    };

    const byType = {
      trial: mockLicenses.filter(l => l.type === 'trial').length,
      monthly: mockLicenses.filter(l => l.type === 'monthly').length,
      yearly: mockLicenses.filter(l => l.type === 'yearly').length,
      lifetime: mockLicenses.filter(l => l.type === 'lifetime').length,
    };

    return {
      total,
      active,
      trial,
      expired,
      suspended,
      expiringSoon,
      byBusinessType,
      byType,
    };
  });
