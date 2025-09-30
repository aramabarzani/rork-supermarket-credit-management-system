import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import type { Message, MessageStats } from '@/types/messaging';

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'admin1',
    senderName: 'ئەحمەد محەمەد',
    senderRole: 'admin',
    recipientId: 'emp1',
    recipientName: 'سارا ئیبراهیم',
    recipientRole: 'employee',
    subject: 'ڕاپۆرتی مانگانە',
    content: 'تکایە ڕاپۆرتی مانگانە ئامادە بکە بۆ کۆبوونەوەی سبەینێ.',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    senderId: 'emp1',
    senderName: 'سارا ئیبراهیم',
    senderRole: 'employee',
    recipientId: 'admin1',
    recipientName: 'ئەحمەد محەمەد',
    recipientRole: 'admin',
    subject: 'وەڵامی ڕاپۆرت',
    content: 'باشە، ڕاپۆرتەکە ئامادە دەکەم و دەینێرم.',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    replyToId: '1',
  },
];

export const getMessagesProcedure = protectedProcedure
  .input(
    z.object({
      filters: z
        .object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          senderId: z.string().optional(),
          recipientId: z.string().optional(),
          isRead: z.boolean().optional(),
          role: z.enum(['admin', 'employee', 'customer']).optional(),
        })
        .optional(),
    })
  )
  .query(({ input }) => {
    let filtered = [...mockMessages];

    if (input.filters) {
      const { startDate, endDate, senderId, recipientId, isRead, role } = input.filters;

      if (startDate) {
        filtered = filtered.filter((msg) => new Date(msg.createdAt) >= new Date(startDate));
      }
      if (endDate) {
        filtered = filtered.filter((msg) => new Date(msg.createdAt) <= new Date(endDate));
      }
      if (senderId) {
        filtered = filtered.filter((msg) => msg.senderId === senderId);
      }
      if (recipientId) {
        filtered = filtered.filter((msg) => msg.recipientId === recipientId);
      }
      if (isRead !== undefined) {
        filtered = filtered.filter((msg) => msg.isRead === isRead);
      }
      if (role) {
        filtered = filtered.filter((msg) => msg.senderRole === role || msg.recipientRole === role);
      }
    }

    return filtered;
  });

export const sendMessageProcedure = protectedProcedure
  .input(
    z.object({
      recipientId: z.string(),
      recipientName: z.string(),
      recipientRole: z.enum(['admin', 'employee', 'customer']),
      subject: z.string(),
      content: z.string(),
      replyToId: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'current_user',
      senderName: 'بەکارهێنەری ئێستا',
      senderRole: 'admin',
      recipientId: input.recipientId,
      recipientName: input.recipientName,
      recipientRole: input.recipientRole,
      subject: input.subject,
      content: input.content,
      isRead: false,
      createdAt: new Date().toISOString(),
      replyToId: input.replyToId,
    };

    mockMessages.push(newMessage);
    console.log('پەیام نێردرا:', newMessage);

    return { success: true, message: newMessage };
  });

export const markAsReadProcedure = protectedProcedure
  .input(z.object({ messageId: z.string() }))
  .mutation(({ input }) => {
    const message = mockMessages.find((m) => m.id === input.messageId);
    if (message) {
      message.isRead = true;
      message.readAt = new Date().toISOString();
      console.log('پەیام وەک خوێندراوە نیشان کرا:', input.messageId);
    }
    return { success: true };
  });

export const deleteMessageProcedure = protectedProcedure
  .input(z.object({ messageId: z.string() }))
  .mutation(({ input }) => {
    const index = mockMessages.findIndex((m) => m.id === input.messageId);
    if (index !== -1) {
      mockMessages.splice(index, 1);
      console.log('پەیام سڕایەوە:', input.messageId);
    }
    return { success: true };
  });

export const getMessageStatsProcedure = protectedProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(({ input }) => {
    let filtered = [...mockMessages];

    if (input.startDate) {
      filtered = filtered.filter((msg) => new Date(msg.createdAt) >= new Date(input.startDate!));
    }
    if (input.endDate) {
      filtered = filtered.filter((msg) => new Date(msg.createdAt) <= new Date(input.endDate!));
    }

    const stats: MessageStats = {
      totalMessages: filtered.length,
      unreadMessages: filtered.filter((m) => !m.isRead).length,
      sentMessages: filtered.filter((m) => m.senderId === 'current_user').length,
      receivedMessages: filtered.filter((m) => m.recipientId === 'current_user').length,
      messagesByDate: [],
    };

    const dateMap = new Map<string, number>();
    filtered.forEach((msg) => {
      const date = new Date(msg.createdAt).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    stats.messagesByDate = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return stats;
  });

export const shareMessageProcedure = protectedProcedure
  .input(
    z.object({
      messageId: z.string(),
      method: z.enum(['email', 'whatsapp', 'telegram', 'viber', 'sms']),
      recipient: z.string(),
    })
  )
  .mutation(({ input }) => {
    const message = mockMessages.find((m) => m.id === input.messageId);
    if (!message) {
      throw new Error('پەیام نەدۆزرایەوە');
    }

    console.log(`پەیام هاوبەش کرا بە ${input.method} بۆ ${input.recipient}`);
    return { success: true, message: `پەیام بە سەرکەوتوویی هاوبەش کرا بە ${input.method}` };
  });
