import { useState, useCallback, useMemo, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import type { WhatsAppConfig, WhatsAppMessage, WhatsAppTemplate, SMSConfig, SMSMessage, MessageStats } from '@/types/whatsapp';

export const [WhatsAppContext, useWhatsApp] = createContextHook(() => {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [smsConfig, setSmsConfig] = useState<SMSConfig | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [configData, smsConfigData, messagesData, smsMessagesData] = await Promise.all([
        AsyncStorage.getItem('whatsapp_config'),
        AsyncStorage.getItem('sms_config'),
        AsyncStorage.getItem('whatsapp_messages'),
        AsyncStorage.getItem('sms_messages'),
      ]);

      if (configData) {
        setConfig(JSON.parse(configData));
      } else {
        const defaultConfig: WhatsAppConfig = {
          enabled: false,
          autoSendReminders: false,
          reminderDays: [3, 7, 14],
          templates: [
            {
              id: '1',
              name: 'بیرخستنەوەی قەرز',
              type: 'debt_reminder',
              content: 'سڵاو {name}، بیرخستنەوەیەکە کە قەرزێکی {amount} IQD لەسەرتە. تکایە لە کاتی خۆیدا پارەکە بدەرەوە.',
              variables: ['name', 'amount'],
              enabled: true,
            },
            {
              id: '2',
              name: 'پشتڕاستکردنەوەی پارەدان',
              type: 'payment_confirmation',
              content: 'سوپاس {name}، پارەدانەکەت بە بڕی {amount} IQD وەرگیرا.',
              variables: ['name', 'amount'],
              enabled: true,
            },
          ],
        };
        await AsyncStorage.setItem('whatsapp_config', JSON.stringify(defaultConfig));
        setConfig(defaultConfig);
      }

      if (smsConfigData) {
        setSmsConfig(JSON.parse(smsConfigData));
      } else {
        const defaultSmsConfig: SMSConfig = {
          enabled: false,
          provider: 'local',
          autoSendReminders: false,
          reminderDays: [3, 7, 14],
        };
        await AsyncStorage.setItem('sms_config', JSON.stringify(defaultSmsConfig));
        setSmsConfig(defaultSmsConfig);
      }

      if (messagesData) setMessages(JSON.parse(messagesData));
      if (smsMessagesData) setSmsMessages(JSON.parse(smsMessagesData));
    } catch (error) {
      console.error('[WhatsApp] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateConfig = useCallback(async (updates: Partial<WhatsAppConfig>) => {
    const newConfig = { ...config, ...updates } as WhatsAppConfig;
    await AsyncStorage.setItem('whatsapp_config', JSON.stringify(newConfig));
    setConfig(newConfig);
  }, [config]);

  const updateSmsConfig = useCallback(async (updates: Partial<SMSConfig>) => {
    const newConfig = { ...smsConfig, ...updates } as SMSConfig;
    await AsyncStorage.setItem('sms_config', JSON.stringify(newConfig));
    setSmsConfig(newConfig);
  }, [smsConfig]);

  const sendWhatsAppMessage = useCallback(async (
    customerId: string,
    customerName: string,
    phoneNumber: string,
    message: string,
    templateId?: string
  ) => {
    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      customerId,
      customerName,
      phoneNumber,
      message,
      templateId,
      status: 'pending',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
    };

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        newMessage.status = 'sent';
        newMessage.sentAt = new Date().toISOString();
      } else {
        newMessage.status = 'failed';
        newMessage.errorMessage = 'WhatsApp not installed';
      }
    } catch (error) {
      newMessage.status = 'failed';
      newMessage.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    const updated = [...messages, newMessage];
    await AsyncStorage.setItem('whatsapp_messages', JSON.stringify(updated));
    setMessages(updated);

    return newMessage;
  }, [messages]);

  const sendSMS = useCallback(async (
    customerId: string,
    customerName: string,
    phoneNumber: string,
    message: string
  ) => {
    const newMessage: SMSMessage = {
      id: Date.now().toString(),
      customerId,
      customerName,
      phoneNumber,
      message,
      status: 'pending',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
    };

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const smsUrl = Platform.select({
      ios: `sms:${cleanPhone}&body=${encodeURIComponent(message)}`,
      android: `sms:${cleanPhone}?body=${encodeURIComponent(message)}`,
      default: `sms:${cleanPhone}`,
    });

    try {
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        newMessage.status = 'sent';
        newMessage.sentAt = new Date().toISOString();
      } else {
        newMessage.status = 'failed';
        newMessage.errorMessage = 'SMS not available';
      }
    } catch (error) {
      newMessage.status = 'failed';
      newMessage.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    const updated = [...smsMessages, newMessage];
    await AsyncStorage.setItem('sms_messages', JSON.stringify(updated));
    setSmsMessages(updated);

    return newMessage;
  }, [smsMessages]);

  const sendBulkMessages = useCallback(async (
    customers: { id: string; name: string; phone: string }[],
    message: string,
    type: 'whatsapp' | 'sms'
  ) => {
    const results = [];
    for (const customer of customers) {
      if (type === 'whatsapp') {
        const result = await sendWhatsAppMessage(customer.id, customer.name, customer.phone, message);
        results.push(result);
      } else {
        const result = await sendSMS(customer.id, customer.name, customer.phone, message);
        results.push(result);
      }
    }
    return results;
  }, [sendWhatsAppMessage, sendSMS]);

  const addTemplate = useCallback(async (template: Omit<WhatsAppTemplate, 'id'>) => {
    if (!config) return;

    const newTemplate: WhatsAppTemplate = {
      ...template,
      id: Date.now().toString(),
    };

    const updated = {
      ...config,
      templates: [...config.templates, newTemplate],
    };

    await AsyncStorage.setItem('whatsapp_config', JSON.stringify(updated));
    setConfig(updated);
  }, [config]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<WhatsAppTemplate>) => {
    if (!config) return;

    const updated = {
      ...config,
      templates: config.templates.map(t => t.id === templateId ? { ...t, ...updates } : t),
    };

    await AsyncStorage.setItem('whatsapp_config', JSON.stringify(updated));
    setConfig(updated);
  }, [config]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    if (!config) return;

    const updated = {
      ...config,
      templates: config.templates.filter(t => t.id !== templateId),
    };

    await AsyncStorage.setItem('whatsapp_config', JSON.stringify(updated));
    setConfig(updated);
  }, [config]);

  const stats: MessageStats = useMemo(() => {
    const allMessages = [...messages, ...smsMessages];
    return {
      totalSent: allMessages.filter(m => m.status === 'sent' || m.status === 'delivered').length,
      totalDelivered: allMessages.filter(m => m.status === 'delivered').length,
      totalFailed: allMessages.filter(m => m.status === 'failed').length,
      deliveryRate: allMessages.length > 0 
        ? (allMessages.filter(m => m.status === 'delivered').length / allMessages.length) * 100 
        : 0,
      byType: {
        whatsapp: messages.length,
        sms: smsMessages.length,
      },
      byMonth: [],
    };
  }, [messages, smsMessages]);

  return useMemo(
    () => ({
      config,
      smsConfig,
      messages,
      smsMessages,
      stats,
      isLoading,
      updateConfig,
      updateSmsConfig,
      sendWhatsAppMessage,
      sendSMS,
      sendBulkMessages,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      refreshData: loadData,
    }),
    [config, smsConfig, messages, smsMessages, stats, isLoading, updateConfig, updateSmsConfig, sendWhatsAppMessage, sendSMS, sendBulkMessages, addTemplate, updateTemplate, deleteTemplate, loadData]
  );
});
