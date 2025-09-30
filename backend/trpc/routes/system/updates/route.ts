import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const mockUpdates: Array<{
  id: string;
  version: string;
  releaseDate: Date;
  description: string;
  features: string[];
  bugFixes: string[];
  isAutoUpdate: boolean;
  isCritical: boolean;
  downloadUrl?: string;
  size?: number;
  status: 'available' | 'downloading' | 'installing' | 'installed' | 'failed';
  createdAt: Date;
  installedAt?: Date;
}> = [
  {
    id: '1',
    version: '2.5.0',
    releaseDate: new Date('2025-09-25'),
    description: 'تایبەتمەندیەکانی نوێ و چاککردنەوەی هەڵەکان',
    features: [
      'زیادکردنی ڕاپۆرتی خێرا',
      'باشترکردنی گەڕان',
      'پشتگیری زمانی کوردی',
    ],
    bugFixes: [
      'چاککردنەوەی کێشەی چوونەژوورەوە',
      'چاککردنەوەی هەڵەی پارەدان',
    ],
    isAutoUpdate: true,
    isCritical: false,
    downloadUrl: 'https://example.com/updates/2.5.0',
    size: 45000000,
    status: 'available' as const,
    createdAt: new Date('2025-09-25'),
  },
  {
    id: '2',
    version: '2.4.8',
    releaseDate: new Date('2025-09-20'),
    description: 'چاککردنەوەی ئاسایشی گرنگ',
    features: [],
    bugFixes: [
      'چاککردنەوەی کێشەی ئاسایشی',
      'باشترکردنی کارایی',
    ],
    isAutoUpdate: true,
    isCritical: true,
    status: 'installed' as const,
    createdAt: new Date('2025-09-20'),
    installedAt: new Date('2025-09-21'),
  },
];

const mockSettings = {
  autoCheck: true,
  autoDownload: true,
  autoInstall: false,
  checkInterval: 86400000,
  notifyAdmin: true,
  lastChecked: new Date(),
};

export const checkUpdatesProcedure = publicProcedure.query(() => {
  return {
    hasUpdate: true,
    latestVersion: '2.5.0',
    currentVersion: '2.4.8',
    updates: mockUpdates.filter(u => u.status === 'available'),
  };
});

export const getUpdatesProcedure = publicProcedure.query(() => {
  return mockUpdates;
});

export const getUpdateSettingsProcedure = publicProcedure.query(() => {
  return mockSettings;
});

export const updateSettingsProcedure = publicProcedure
  .input(
    z.object({
      autoCheck: z.boolean().optional(),
      autoDownload: z.boolean().optional(),
      autoInstall: z.boolean().optional(),
      checkInterval: z.number().optional(),
      notifyAdmin: z.boolean().optional(),
    })
  )
  .mutation(({ input }) => {
    Object.assign(mockSettings, input);
    return mockSettings;
  });

export const downloadUpdateProcedure = publicProcedure
  .input(z.object({ updateId: z.string() }))
  .mutation(({ input }) => {
    const update = mockUpdates.find(u => u.id === input.updateId);
    if (update) {
      update.status = 'downloading';
      setTimeout(() => {
        update.status = 'installing';
      }, 2000);
    }
    return { success: true, update };
  });

export const installUpdateProcedure = publicProcedure
  .input(z.object({ updateId: z.string() }))
  .mutation(({ input }) => {
    const update = mockUpdates.find(u => u.id === input.updateId);
    if (update) {
      update.status = 'installed';
      update.installedAt = new Date();
    }
    return { success: true, update };
  });
