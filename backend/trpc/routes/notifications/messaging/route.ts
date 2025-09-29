import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import type { WhatsAppProvider, MessageAttachment } from '@/types/notification';

// Mock WhatsApp provider - replace with actual WhatsApp Business API
const mockWhatsAppProvider: WhatsAppProvider = {
  async sendMessage(to: string, message: string, attachments?: MessageAttachment[]) {
    console.log(`WhatsApp message sent to ${to}: ${message}`);
    if (attachments?.length) {
      console.log('Attachments:', attachments.map(a => a.filename));
    }
    
    // Simulate API call delay
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    
    // Simulate success/failure
    const success = Math.random() > 0.08; // 92% success rate
    
    if (success) {
      return {
        success: true,
        messageId: `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Failed to send WhatsApp message'
      };
    }
  }
};

// Mock Viber provider - similar to WhatsApp
const mockViberProvider = {
  async sendMessage(to: string, message: string, attachments?: MessageAttachment[]) {
    console.log(`Viber message sent to ${to}: ${message}`);
    if (attachments?.length) {
      console.log('Attachments:', attachments.map(a => a.filename));
    }
    
    await new Promise<void>(resolve => setTimeout(resolve, 900));
    
    const success = Math.random() > 0.12; // 88% success rate
    
    if (success) {
      return {
        success: true,
        messageId: `viber_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Failed to send Viber message'
      };
    }
  }
};

export const sendWhatsAppProcedure = protectedProcedure
  .input(z.object({
    to: z.string().min(1, 'Phone number is required'),
    message: z.string().min(1, 'Message is required'),
    customerId: z.string().optional(),
    type: z.enum(['debt', 'payment', 'receipt', 'reminder', 'general']).optional(),
    attachments: z.array(z.object({
      type: z.enum(['receipt', 'report', 'image']),
      url: z.string(),
      filename: z.string(),
      size: z.number()
    })).optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const attachments = input.attachments?.map(att => ({
        ...att,
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));
      
      const result = await mockWhatsAppProvider.sendMessage(
        input.to, 
        input.message, 
        attachments
      );
      
      console.log('WhatsApp attempt:', {
        to: input.to,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        sentBy: 'system',
        customerId: input.customerId,
        type: input.type,
        attachmentCount: input.attachments?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  });

export const sendViberProcedure = protectedProcedure
  .input(z.object({
    to: z.string().min(1, 'Phone number is required'),
    message: z.string().min(1, 'Message is required'),
    customerId: z.string().optional(),
    type: z.enum(['debt', 'payment', 'receipt', 'reminder', 'general']).optional(),
    attachments: z.array(z.object({
      type: z.enum(['receipt', 'report', 'image']),
      url: z.string(),
      filename: z.string(),
      size: z.number()
    })).optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const attachments = input.attachments?.map(att => ({
        ...att,
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));
      
      const result = await mockViberProvider.sendMessage(
        input.to, 
        input.message, 
        attachments
      );
      
      console.log('Viber attempt:', {
        to: input.to,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        sentBy: 'system',
        customerId: input.customerId,
        type: input.type,
        attachmentCount: input.attachments?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      console.error('Viber sending error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  });

export const sendReceiptWhatsAppProcedure = protectedProcedure
  .input(z.object({
    to: z.string(),
    customerName: z.string(),
    receiptData: z.object({
      receiptId: z.string(),
      amount: z.number(),
      type: z.enum(['debt', 'payment']),
      date: z.string(),
      description: z.string().optional()
    }),
    customerId: z.string().optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const message = `
🧾 *وەسڵی ${input.receiptData.type === 'debt' ? 'قەرز' : 'پارەدان'}*

بەڕێز *${input.customerName}*،

📋 ژمارەی وەسڵ: \`${input.receiptData.receiptId}\`
💰 بڕ: *${input.receiptData.amount.toLocaleString()} دینار*
📝 جۆر: ${input.receiptData.type === 'debt' ? '🔴 قەرز' : '🟢 پارەدان'}
📅 بەروار: ${new Date(input.receiptData.date).toLocaleDateString('ku')}
${input.receiptData.description ? `📄 وەسف: ${input.receiptData.description}` : ''}

🙏 سوپاس بۆ هاوکاریتان

_سیستەمی بەڕێوەبردنی قەرزی سوپەرمارکێت_
      `.trim();

      const result = await mockWhatsAppProvider.sendMessage(input.to, message);
      
      console.log('Receipt WhatsApp sent:', {
        to: input.to,
        receiptId: input.receiptData.receiptId,
        success: result.success,
        customerId: input.customerId
      });
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      console.error('Receipt WhatsApp error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  });

export const sendBulkWhatsAppProcedure = protectedProcedure
  .input(z.object({
    recipients: z.array(z.object({
      phoneNumber: z.string(),
      customerId: z.string().optional(),
      variables: z.record(z.string(), z.any()).optional()
    })),
    messageTemplate: z.string(),
    type: z.enum(['debt', 'payment', 'receipt', 'reminder', 'general']).optional(),
    attachments: z.array(z.object({
      type: z.enum(['receipt', 'report', 'image']),
      url: z.string(),
      filename: z.string(),
      size: z.number()
    })).optional()
  }))
  .mutation(async ({ input }) => {
    const results = [];
    
    for (const recipient of input.recipients) {
      try {
        // Replace variables in template
        let message = input.messageTemplate;
        if (recipient.variables) {
          Object.entries(recipient.variables).forEach(([key, value]) => {
            message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
          });
        }
        
        const attachments = input.attachments?.map(att => ({
          ...att,
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
        
        const result = await mockWhatsAppProvider.sendMessage(
          recipient.phoneNumber, 
          message, 
          attachments
        );
        
        results.push({
          phoneNumber: recipient.phoneNumber,
          customerId: recipient.customerId,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
        
        // Delay between messages to avoid rate limiting
        await new Promise<void>(resolve => setTimeout(resolve, 300));
      } catch {
        results.push({
          phoneNumber: recipient.phoneNumber,
          customerId: recipient.customerId,
          success: false,
          error: 'Failed to send WhatsApp message'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log('Bulk WhatsApp results:', {
      total: results.length,
      success: successCount,
      failed: failureCount,
      type: input.type,
      timestamp: new Date().toISOString()
    });
    
    return {
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount
      }
    };
  });

export const getMessagingStatsProcedure = protectedProcedure
  .query(async () => {
    return {
      whatsapp: {
        totalSent: 2150,
        totalDelivered: 1980,
        totalFailed: 170,
        deliveryRate: 92.1,
        lastWeekSent: 320,
        thisMonthSent: 1200
      },
      viber: {
        totalSent: 890,
        totalDelivered: 780,
        totalFailed: 110,
        deliveryRate: 87.6,
        lastWeekSent: 140,
        thisMonthSent: 520
      },
      byType: {
        debt: { whatsapp: 650, viber: 280 },
        payment: { whatsapp: 580, viber: 240 },
        receipt: { whatsapp: 520, viber: 220 },
        reminder: { whatsapp: 300, viber: 120 },
        general: { whatsapp: 100, viber: 30 }
      }
    };
  });