import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import type { Newsletter } from '../../../../../types/guidance';

const newsletterSchema = z.object({
  title: z.string(),
  titleKu: z.string(),
  content: z.string(),
  contentKu: z.string(),
  type: z.enum(['update', 'announcement', 'monthly', 'vip']),
  targetRole: z.enum(['admin', 'employee', 'customer']).optional(),
  vipOnly: z.boolean(),
  scheduledAt: z.string().optional(),
});

const mockNewsletters: Newsletter[] = [
  {
    id: '1',
    title: 'System Update v2.0',
    titleKu: 'نوێکردنەوەی سیستەم v2.0',
    content: 'New features and improvements',
    contentKu: 'تایبەتمەندی و باشکردنی نوێ',
    type: 'update',
    vipOnly: false,
    status: 'sent',
    sentAt: new Date(Date.now() - 86400000),
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: '2',
    title: 'Monthly Report - December',
    titleKu: 'ڕاپۆرتی مانگانە - کانوونی یەکەم',
    content: 'Monthly statistics and insights',
    contentKu: 'ئاماری مانگانە و تێڕوانین',
    type: 'monthly',
    vipOnly: false,
    status: 'sent',
    sentAt: new Date(Date.now() - 604800000),
    createdAt: new Date(Date.now() - 691200000),
  },
  {
    id: '3',
    title: 'VIP Exclusive Offer',
    titleKu: 'پێشکەشکراوی تایبەتی VIP',
    content: 'Special benefits for VIP customers',
    contentKu: 'سوودە تایبەتیەکان بۆ کڕیارانی VIP',
    type: 'vip',
    targetRole: 'customer',
    vipOnly: true,
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
  },
];

export const newslettersProcedure = publicProcedure
  .input(
    z.object({
      status: z.enum(['draft', 'scheduled', 'sent']).optional(),
      type: z.enum(['update', 'announcement', 'monthly', 'vip']).optional(),
    })
  )
  .query(({ input }) => {
    let filtered = mockNewsletters;
    if (input.status) {
      filtered = filtered.filter((n) => n.status === input.status);
    }
    if (input.type) {
      filtered = filtered.filter((n) => n.type === input.type);
    }
    return filtered;
  });

export const createNewsletterProcedure = publicProcedure
  .input(newsletterSchema)
  .mutation(({ input }) => {
    const newNewsletter: Newsletter = {
      id: Date.now().toString(),
      ...input,
      status: input.scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      createdAt: new Date(),
    };
    mockNewsletters.push(newNewsletter);
    return newNewsletter;
  });

export const sendNewsletterProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      channels: z.array(z.enum(['email', 'whatsapp', 'telegram', 'viber'])),
    })
  )
  .mutation(({ input }) => {
    const index = mockNewsletters.findIndex((n) => n.id === input.id);
    if (index === -1) {
      throw new Error('Newsletter not found');
    }
    mockNewsletters[index] = {
      ...mockNewsletters[index],
      status: 'sent',
      sentAt: new Date(),
    };
    return {
      success: true,
      channels: input.channels,
      newsletter: mockNewsletters[index],
    };
  });

export const deleteNewsletterProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const index = mockNewsletters.findIndex((n) => n.id === input.id);
    if (index === -1) {
      throw new Error('Newsletter not found');
    }
    mockNewsletters.splice(index, 1);
    return { success: true };
  });
