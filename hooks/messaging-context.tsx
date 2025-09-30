import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, BroadcastMessage, EmployeeRating, CustomerRating } from '@/types/messaging';
import { useAuth } from './auth-context';

export const [MessagingProvider, useMessaging] = createContextHook(() => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [broadcastMessages, setBroadcastMessages] = useState<BroadcastMessage[]>([]);
  const [employeeRatings, setEmployeeRatings] = useState<EmployeeRating[]>([]);
  const [customerRatings, setCustomerRatings] = useState<CustomerRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      const [messagesData, broadcastData, empRatingsData, custRatingsData] = await Promise.all([
        AsyncStorage.getItem('messages'),
        AsyncStorage.getItem('broadcast_messages'),
        AsyncStorage.getItem('employee_ratings'),
        AsyncStorage.getItem('customer_ratings'),
      ]);

      if (messagesData) setMessages(JSON.parse(messagesData));
      if (broadcastData) setBroadcastMessages(JSON.parse(broadcastData));
      if (empRatingsData) setEmployeeRatings(JSON.parse(empRatingsData));
      if (custRatingsData) setCustomerRatings(JSON.parse(custRatingsData));
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
      await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));

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
      const allUsers = await AsyncStorage.getItem('users');
      let recipientCount = 0;

      if (allUsers) {
        const users = JSON.parse(allUsers);
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
      await AsyncStorage.setItem('broadcast_messages', JSON.stringify(updatedBroadcasts));

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
    await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
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
      await AsyncStorage.setItem('employee_ratings', JSON.stringify(updatedRatings));

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
      await AsyncStorage.setItem('customer_ratings', JSON.stringify(updatedRatings));

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

  return useMemo(() => ({
    messages,
    broadcastMessages,
    employeeRatings,
    customerRatings,
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
  }), [
    messages,
    broadcastMessages,
    employeeRatings,
    customerRatings,
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
  ]);
});
