import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Message, BroadcastMessage, EmployeeRating, CustomerRating, Conversation, ChatMessage } from '@/types/messaging';
import { useAuth } from './auth-context';
import { safeStorage } from '@/utils/storage';

export const [MessagingProvider, useMessaging] = createContextHook(() => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [broadcastMessages, setBroadcastMessages] = useState<BroadcastMessage[]>([]);
  const [employeeRatings, setEmployeeRatings] = useState<EmployeeRating[]>([]);
  const [customerRatings, setCustomerRatings] = useState<CustomerRating[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      const [messagesData, broadcastData, empRatingsData, custRatingsData, conversationsData, chatMessagesData] = await Promise.all([
        safeStorage.getItem<Message[]>('messages', []),
        safeStorage.getItem<BroadcastMessage[]>('broadcast_messages', []),
        safeStorage.getItem<EmployeeRating[]>('employee_ratings', []),
        safeStorage.getItem<CustomerRating[]>('customer_ratings', []),
        safeStorage.getItem<Conversation[]>('conversations', []),
        safeStorage.getItem<ChatMessage[]>('chat_messages', []),
      ]);

      setMessages(messagesData || []);
      setBroadcastMessages(broadcastData || []);
      setEmployeeRatings(empRatingsData || []);
      setCustomerRatings(custRatingsData || []);
      setConversations(conversationsData || []);
      setChatMessages(chatMessagesData || []);
    } catch (error) {
      console.error('Error loading messaging data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async (message: Omit<Message, 'id' | 'createdAt' | 'isRead'>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'بەکارهێنەر نەدۆزرایەوە' };
    }

    try {
      const newMessage: Message = {
        ...message,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      await safeStorage.setItem('messages', updatedMessages);

      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: 'هەڵەیەک ڕوویدا' };
    }
  }, [user, messages]);

  const sendBroadcastMessage = useCallback(async (
    targetRole: 'all' | 'customers' | 'employees',
    subject: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'تەنها بەڕێوەبەر دەتوانێت پەیامی گشتی بنێرێت' };
    }

    try {
      const allUsers = await safeStorage.getItem<any[]>('users', []);
      let recipientCount = 0;

      if (allUsers) {
        const users = allUsers;
        recipientCount = users.filter((u: any) => {
          if (targetRole === 'all') return true;
          if (targetRole === 'customers') return u.role === 'customer';
          if (targetRole === 'employees') return u.role === 'employee';
          return false;
        }).length;
      }

      const newBroadcast: BroadcastMessage = {
        id: Date.now().toString(),
        senderId: user.id,
        senderName: user.name,
        targetRole,
        subject,
        content,
        createdAt: new Date().toISOString(),
        recipientCount,
        readCount: 0,
      };

      const updatedBroadcasts = [...broadcastMessages, newBroadcast];
      setBroadcastMessages(updatedBroadcasts);
      await safeStorage.setItem('broadcast_messages', updatedBroadcasts);

      return { success: true };
    } catch (error) {
      console.error('Error sending broadcast:', error);
      return { success: false, error: 'هەڵەیەک ڕوویدا' };
    }
  }, [user, broadcastMessages]);

  const markAsRead = useCallback(async (messageId: string) => {
    const updatedMessages = messages.map(m =>
      m.id === messageId ? { ...m, isRead: true, readAt: new Date().toISOString() } : m
    );
    setMessages(updatedMessages);
    await safeStorage.setItem('messages', updatedMessages);
  }, [messages]);

  const rateEmployee = useCallback(async (
    employeeId: string,
    employeeName: string,
    rating: number,
    category: EmployeeRating['category'],
    comment: string,
    period: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'تەنها بەڕێوەبەر دەتوانێت هەڵسەنگاندن بکات' };
    }

    try {
      const newRating: EmployeeRating = {
        id: Date.now().toString(),
        employeeId,
        employeeName,
        ratedBy: user.id,
        raterName: user.name,
        rating,
        category,
        comment,
        createdAt: new Date().toISOString(),
        period,
      };

      const updatedRatings = [...employeeRatings, newRating];
      setEmployeeRatings(updatedRatings);
      await safeStorage.setItem('employee_ratings', updatedRatings);

      return { success: true };
    } catch (error) {
      console.error('Error rating employee:', error);
      return { success: false, error: 'هەڵەیەک ڕوویدا' };
    }
  }, [user, employeeRatings]);

  const rateCustomer = useCallback(async (
    customerId: string,
    customerName: string,
    rating: number,
    category: CustomerRating['category'],
    comment: string,
    onTimePayments: number,
    latePayments: number,
    totalDebt: number,
    paidAmount: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'تەنها بەڕێوەبەر دەتوانێت هەڵسەنگاندن بکات' };
    }

    try {
      const newRating: CustomerRating = {
        id: Date.now().toString(),
        customerId,
        customerName,
        ratedBy: user.id,
        raterName: user.name,
        rating,
        category,
        comment,
        createdAt: new Date().toISOString(),
        onTimePayments,
        latePayments,
        totalDebt,
        paidAmount,
      };

      const updatedRatings = [...customerRatings, newRating];
      setCustomerRatings(updatedRatings);
      await safeStorage.setItem('customer_ratings', updatedRatings);

      return { success: true };
    } catch (error) {
      console.error('Error rating customer:', error);
      return { success: false, error: 'هەڵەیەک ڕوویدا' };
    }
  }, [user, customerRatings]);

  const getInboxMessages = useCallback(() => {
    if (!user) return [];
    return messages.filter(m => m.recipientId === user.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [user, messages]);

  const getSentMessages = useCallback(() => {
    if (!user) return [];
    return messages.filter(m => m.senderId === user.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [user, messages]);

  const getUnreadCount = useCallback(() => {
    if (!user) return 0;
    return messages.filter(m => m.recipientId === user.id && !m.isRead).length;
  }, [user, messages]);

  const getEmployeeRatings = useCallback((employeeId: string) => {
    return employeeRatings.filter(r => r.employeeId === employeeId);
  }, [employeeRatings]);

  const getCustomerRatings = useCallback((customerId: string) => {
    return customerRatings.filter(r => r.customerId === customerId);
  }, [customerRatings]);

  const getAverageEmployeeRating = useCallback((employeeId: string) => {
    const ratings = employeeRatings.filter(r => r.employeeId === employeeId);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  }, [employeeRatings]);

  const getAverageCustomerRating = useCallback((customerId: string) => {
    const ratings = customerRatings.filter(r => r.customerId === customerId);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  }, [customerRatings]);

  const getOrCreateConversation = useCallback(async (participantId: string, participantName: string, participantRole: 'admin' | 'employee' | 'customer'): Promise<Conversation> => {
    if (!user) {
      throw new Error('بەکارهێنەر نەدۆزرایەوە');
    }

    const existingConversation = conversations.find(c => 
      c.participants.some(p => p.userId === user.id) &&
      c.participants.some(p => p.userId === participantId)
    );

    if (existingConversation) {
      return existingConversation;
    }

    const newConversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants: [
        {
          userId: user.id,
          userName: user.name,
          userRole: user.role as 'admin' | 'employee' | 'customer',
          joinedAt: new Date().toISOString(),
        },
        {
          userId: participantId,
          userName: participantName,
          userRole: participantRole,
          joinedAt: new Date().toISOString(),
        },
      ],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    await safeStorage.setItem('conversations', updatedConversations);

    return newConversation;
  }, [user, conversations]);

  const sendChatMessage = useCallback(async (conversationId: string, content: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'بەکارهێنەر نەدۆزرایەوە' };
    }

    try {
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role as 'admin' | 'employee' | 'customer',
        content,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      const updatedChatMessages = [...chatMessages, newMessage];
      setChatMessages(updatedChatMessages);
      await safeStorage.setItem('chat_messages', updatedChatMessages);

      const updatedConversations = conversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: newMessage,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });
      setConversations(updatedConversations);
      await safeStorage.setItem('conversations', updatedConversations);

      return { success: true };
    } catch (error) {
      console.error('Error sending chat message:', error);
      return { success: false, error: 'هەڵەیەک ڕوویدا' };
    }
  }, [user, chatMessages, conversations]);

  const getConversationMessages = useCallback((conversationId: string) => {
    return chatMessages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [chatMessages]);

  const getUserConversations = useCallback(() => {
    if (!user) return [];
    return conversations
      .filter(c => c.participants.some(p => p.userId === user.id))
      .map(c => {
        const unreadMessages = chatMessages.filter(
          m => m.conversationId === c.id && m.senderId !== user.id && !m.isRead
        ).length;
        return {
          ...c,
          unreadCount: unreadMessages,
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [user, conversations, chatMessages]);

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    const updatedChatMessages = chatMessages.map(m => {
      if (m.conversationId === conversationId && m.senderId !== user.id && !m.isRead) {
        return { ...m, isRead: true, readAt: new Date().toISOString() };
      }
      return m;
    });
    setChatMessages(updatedChatMessages);
    await safeStorage.setItem('chat_messages', updatedChatMessages);
  }, [user, chatMessages]);

  const getTotalUnreadConversations = useCallback(() => {
    if (!user) return 0;
    const userConversations = getUserConversations();
    return userConversations.filter(c => c.unreadCount > 0).length;
  }, [user, getUserConversations]);

  return useMemo(() => ({
    messages,
    broadcastMessages,
    employeeRatings,
    customerRatings,
    conversations,
    chatMessages,
    isLoading,
    sendMessage,
    sendBroadcastMessage,
    markAsRead,
    rateEmployee,
    rateCustomer,
    getInboxMessages,
    getSentMessages,
    getUnreadCount,
    getEmployeeRatings,
    getCustomerRatings,
    getAverageEmployeeRating,
    getAverageCustomerRating,
    getOrCreateConversation,
    sendChatMessage,
    getConversationMessages,
    getUserConversations,
    markConversationAsRead,
    getTotalUnreadConversations,
  }), [
    messages,
    broadcastMessages,
    employeeRatings,
    customerRatings,
    conversations,
    chatMessages,
    isLoading,
    sendMessage,
    sendBroadcastMessage,
    markAsRead,
    rateEmployee,
    rateCustomer,
    getInboxMessages,
    getSentMessages,
    getUnreadCount,
    getEmployeeRatings,
    getCustomerRatings,
    getAverageEmployeeRating,
    getAverageCustomerRating,
    getOrCreateConversation,
    sendChatMessage,
    getConversationMessages,
    getUserConversations,
    markConversationAsRead,
    getTotalUnreadConversations,
  ]);
});
