import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const sendDirectMessageProcedure = protectedProcedure
  .input(z.object({
    receiverId: z.string(),
    message: z.string().min(1, 'Message is required'),
    messageType: z.enum(['text', 'receipt', 'report']).default('text'),
    attachments: z.array(z.object({
      type: z.enum(['receipt', 'report', 'image']),
      url: z.string(),
      filename: z.string(),
      size: z.number()
    })).optional()
  }))
  .mutation(async ({ input }) => {
    try {
      // In a real implementation, this would save to database
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const threadId = `thread_${input.receiverId}_system`;
      
      const directMessage = {
        id: messageId,
        threadId,
        senderId: 'system', // In real app, get from context
        receiverId: input.receiverId,
        message: input.message,
        timestamp: new Date(),
        read: false,
        messageType: input.messageType,
        attachments: input.attachments?.map(att => ({
          ...att,
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      
      console.log('Direct message sent:', {
        messageId,
        receiverId: input.receiverId,
        messageType: input.messageType,
        attachmentCount: input.attachments?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        messageId,
        message: directMessage
      };
    } catch (error) {
      console.error('Direct message error:', error);
      return {
        success: false,
        error: 'Failed to send message'
      };
    }
  });

export const getMessageThreadsProcedure = protectedProcedure
  .input(z.object({
    userId: z.string().optional()
  }))
  .query(async ({ input }) => {
    // Mock data - in real implementation, query database
    const mockThreads = [
      {
        id: 'thread_1',
        participants: ['admin', 'employee_1'],
        lastMessage: {
          id: 'msg_1',
          threadId: 'thread_1',
          senderId: 'admin',
          receiverId: 'employee_1',
          message: 'کڕیاری نوێ زیاد کرا',
          timestamp: new Date(Date.now() - 3600000),
          read: true,
          messageType: 'text' as const,
          attachments: []
        },
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'thread_2',
        participants: ['admin', 'customer_1'],
        lastMessage: {
          id: 'msg_2',
          threadId: 'thread_2',
          senderId: 'admin',
          receiverId: 'customer_1',
          message: 'وەسڵی پارەدانتان ناردرا',
          timestamp: new Date(Date.now() - 7200000),
          read: false,
          messageType: 'receipt' as const,
          attachments: []
        },
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 7200000)
      }
    ];
    
    return {
      threads: mockThreads,
      unreadCount: mockThreads.filter(t => !t.lastMessage?.read).length
    };
  });

export const getThreadMessagesProcedure = protectedProcedure
  .input(z.object({
    threadId: z.string()
  }))
  .query(async ({ input }) => {
    // Mock messages for the thread
    const mockMessages = [
      {
        id: 'msg_1',
        threadId: input.threadId,
        senderId: 'admin',
        receiverId: 'employee_1',
        message: 'سڵاو، چۆنی؟',
        timestamp: new Date(Date.now() - 86400000),
        read: true,
        messageType: 'text' as const,
        attachments: []
      },
      {
        id: 'msg_2',
        threadId: input.threadId,
        senderId: 'employee_1',
        receiverId: 'admin',
        message: 'سڵاو، باشم سوپاس',
        timestamp: new Date(Date.now() - 82800000),
        read: true,
        messageType: 'text' as const,
        attachments: []
      },
      {
        id: 'msg_3',
        threadId: input.threadId,
        senderId: 'admin',
        receiverId: 'employee_1',
        message: 'کڕیاری نوێ زیاد کرا، تکایە بیبینە',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        messageType: 'text' as const,
        attachments: []
      }
    ];
    
    return {
      messages: mockMessages
    };
  });

export const markMessageAsReadProcedure = protectedProcedure
  .input(z.object({
    messageId: z.string()
  }))
  .mutation(async ({ input }) => {
    // In real implementation, update database
    console.log('Message marked as read:', input.messageId);
    
    return {
      success: true,
      messageId: input.messageId
    };
  });

export const markThreadAsReadProcedure = protectedProcedure
  .input(z.object({
    threadId: z.string()
  }))
  .mutation(async ({ input }) => {
    // In real implementation, update all messages in thread
    console.log('Thread marked as read:', input.threadId);
    
    return {
      success: true,
      threadId: input.threadId
    };
  });