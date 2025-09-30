import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import type { Conversation, ChatMessage, ChatStats } from '@/types/messaging';

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [
      { userId: 'admin1', userName: 'ئەحمەد محەمەد', userRole: 'admin', joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { userId: 'emp1', userName: 'سارا ئیبراهیم', userRole: 'employee', joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    lastMessage: {
      id: 'chat1',
      conversationId: 'conv1',
      senderId: 'emp1',
      senderName: 'سارا ئیبراهیم',
      senderRole: 'employee',
      content: 'باشە، سوپاس بۆ زانیاریەکان',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: true,
      readAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const mockChatMessages: ChatMessage[] = [
  {
    id: 'chat1',
    conversationId: 'conv1',
    senderId: 'admin1',
    senderName: 'ئەحمەد محەمەد',
    senderRole: 'admin',
    content: 'سڵاو، چۆنی؟ پرسیارێکم هەیە دەربارەی ڕاپۆرتەکە',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    readAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'chat2',
    conversationId: 'conv1',
    senderId: 'emp1',
    senderName: 'سارا ئیبراهیم',
    senderRole: 'employee',
    content: 'سڵاو، باشم سوپاس. بفەرموو چی پێویستە؟',
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    readAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export const getConversationsProcedure = protectedProcedure
  .input(
    z.object({
      filters: z
        .object({
          participantId: z.string().optional(),
          hasUnread: z.boolean().optional(),
        })
        .optional(),
    })
  )
  .query(({ input }) => {
    let filtered = [...mockConversations];

    if (input.filters) {
      const { participantId, hasUnread } = input.filters;

      if (participantId) {
        filtered = filtered.filter((conv) =>
          conv.participants.some((p) => p.userId === participantId)
        );
      }
      if (hasUnread !== undefined) {
        filtered = filtered.filter((conv) => (hasUnread ? conv.unreadCount > 0 : conv.unreadCount === 0));
      }
    }

    return filtered;
  });

export const getChatMessagesProcedure = protectedProcedure
  .input(z.object({ conversationId: z.string() }))
  .query(({ input }) => {
    return mockChatMessages.filter((msg) => msg.conversationId === input.conversationId);
  });

export const sendChatMessageProcedure = protectedProcedure
  .input(
    z.object({
      conversationId: z.string(),
      content: z.string(),
    })
  )
  .mutation(({ input }) => {
    const newMessage: ChatMessage = {
      id: `chat_${Date.now()}`,
      conversationId: input.conversationId,
      senderId: 'current_user',
      senderName: 'بەکارهێنەری ئێستا',
      senderRole: 'admin',
      content: input.content,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    mockChatMessages.push(newMessage);

    const conversation = mockConversations.find((c) => c.id === input.conversationId);
    if (conversation) {
      conversation.lastMessage = newMessage;
      conversation.updatedAt = newMessage.createdAt;
    }

    console.log('پەیامی چات نێردرا:', newMessage);
    return { success: true, message: newMessage };
  });

export const createConversationProcedure = protectedProcedure
  .input(
    z.object({
      participantIds: z.array(z.string()),
      participantNames: z.array(z.string()),
      participantRoles: z.array(z.enum(['admin', 'employee', 'customer'])),
    })
  )
  .mutation(({ input }) => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      participants: input.participantIds.map((id, index) => ({
        userId: id,
        userName: input.participantNames[index],
        userRole: input.participantRoles[index],
        joinedAt: new Date().toISOString(),
      })),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockConversations.push(newConversation);
    console.log('گفتوگۆی نوێ دروست کرا:', newConversation);

    return { success: true, conversation: newConversation };
  });

export const markChatAsReadProcedure = protectedProcedure
  .input(z.object({ conversationId: z.string() }))
  .mutation(({ input }) => {
    const conversation = mockConversations.find((c) => c.id === input.conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
      mockChatMessages
        .filter((msg) => msg.conversationId === input.conversationId && !msg.isRead)
        .forEach((msg) => {
          msg.isRead = true;
          msg.readAt = new Date().toISOString();
        });
      console.log('چات وەک خوێندراوە نیشان کرا:', input.conversationId);
    }
    return { success: true };
  });

export const getChatStatsProcedure = protectedProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(({ input }) => {
    let filteredMessages = [...mockChatMessages];

    if (input.startDate) {
      filteredMessages = filteredMessages.filter(
        (msg) => new Date(msg.createdAt) >= new Date(input.startDate!)
      );
    }
    if (input.endDate) {
      filteredMessages = filteredMessages.filter(
        (msg) => new Date(msg.createdAt) <= new Date(input.endDate!)
      );
    }

    const stats: ChatStats = {
      totalConversations: mockConversations.length,
      activeConversations: mockConversations.filter((c) => c.lastMessage).length,
      totalChatMessages: filteredMessages.length,
      averageResponseTime: 15,
      chatsByDate: [],
    };

    const dateMap = new Map<string, number>();
    filteredMessages.forEach((msg) => {
      const date = new Date(msg.createdAt).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    stats.chatsByDate = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return stats;
  });

export const shareChatProcedure = protectedProcedure
  .input(
    z.object({
      conversationId: z.string(),
      method: z.enum(['email', 'pdf', 'excel']),
      recipient: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    const conversation = mockConversations.find((c) => c.id === input.conversationId);
    if (!conversation) {
      throw new Error('گفتوگۆ نەدۆزرایەوە');
    }

    console.log(`گفتوگۆ هاوبەش کرا بە ${input.method}`);
    return { success: true, message: `گفتوگۆ بە سەرکەوتوویی هاوبەش کرا بە ${input.method}` };
  });
