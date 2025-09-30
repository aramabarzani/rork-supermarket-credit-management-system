import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import type { HelpMessage } from '../../../../../types/guidance';

const helpMessageSchema = z.object({
  screen: z.string(),
  message: z.string(),
  messageKu: z.string(),
  role: z.enum(['admin', 'employee', 'customer']).optional(),
  position: z.enum(['top', 'bottom', 'center']),
  type: z.enum(['info', 'warning', 'success', 'error']),
});

const mockHelpMessages: HelpMessage[] = [
  {
    id: '1',
    screen: 'dashboard',
    message: 'Welcome to your dashboard. Here you can see an overview of all activities.',
    messageKu: 'بەخێربێیت بۆ داشبۆردەکەت. لێرە دەتوانیت پێداچوونەوەیەک بە هەموو چالاکیەکان ببینیت.',
    position: 'top',
    type: 'info',
    createdAt: new Date(),
  },
  {
    id: '2',
    screen: 'add-debt',
    message: 'Fill in all required fields to add a new debt record.',
    messageKu: 'هەموو خانە پێویستەکان پڕ بکەرەوە بۆ زیادکردنی تۆماری قەرزی نوێ.',
    role: 'employee',
    position: 'top',
    type: 'info',
    createdAt: new Date(),
  },
  {
    id: '3',
    screen: 'payments',
    message: 'Payment records cannot be deleted after 24 hours.',
    messageKu: 'تۆماری پارەدان ناتوانرێت بسڕدرێتەوە دوای ٢٤ کاتژمێر.',
    position: 'bottom',
    type: 'warning',
    createdAt: new Date(),
  },
];

export const helpMessagesProcedure = publicProcedure
  .input(
    z.object({
      screen: z.string().optional(),
      role: z.enum(['admin', 'employee', 'customer']).optional(),
    })
  )
  .query(({ input }) => {
    let filtered = mockHelpMessages;
    if (input.screen) {
      filtered = filtered.filter((m) => m.screen === input.screen);
    }
    if (input.role) {
      filtered = filtered.filter((m) => !m.role || m.role === input.role);
    }
    return filtered;
  });

export const createHelpMessageProcedure = publicProcedure
  .input(helpMessageSchema)
  .mutation(({ input }) => {
    const newMessage: HelpMessage = {
      id: Date.now().toString(),
      ...input,
      createdAt: new Date(),
    };
    mockHelpMessages.push(newMessage);
    return newMessage;
  });

export const deleteHelpMessageProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const index = mockHelpMessages.findIndex((m) => m.id === input.id);
    if (index === -1) {
      throw new Error('Help message not found');
    }
    mockHelpMessages.splice(index, 1);
    return { success: true };
  });
