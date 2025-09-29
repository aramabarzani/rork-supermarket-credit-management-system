import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import type { SMSProvider } from '@/types/notification';

// Mock SMS provider - replace with actual SMS service (Twilio, AWS SNS, etc.)
const mockSMSProvider: SMSProvider = {
  async sendSMS(to: string, message: string) {
    console.log(`SMS sent to ${to}: ${message}`);
    
    // Simulate API call delay
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
    
    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return {
        success: true,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Failed to send SMS'
      };
    }
  }
};

export const sendSMSProcedure = protectedProcedure
  .input(z.object({
    to: z.string().min(1, 'Phone number is required'),
    message: z.string().min(1, 'Message is required'),
    customerId: z.string().optional(),
    type: z.enum(['debt', 'payment', 'receipt', 'reminder', 'general']).optional()
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await mockSMSProvider.sendSMS(input.to, input.message);
      
      // Log the SMS attempt
      console.log('SMS attempt:', {
        to: input.to,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        sentBy: 'system',
        customerId: input.customerId,
        type: input.type,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  });

export const sendBulkSMSProcedure = protectedProcedure
  .input(z.object({
    recipients: z.array(z.object({
      phoneNumber: z.string(),
      customerId: z.string().optional(),
      variables: z.record(z.string(), z.any()).optional()
    })),
    messageTemplate: z.string(),
    type: z.enum(['debt', 'payment', 'receipt', 'reminder', 'general']).optional()
  }))
  .mutation(async ({ input, ctx }) => {
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
        
        const result = await mockSMSProvider.sendSMS(recipient.phoneNumber, message);
        
        results.push({
          phoneNumber: recipient.phoneNumber,
          customerId: recipient.customerId,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
        
        // Small delay between messages to avoid rate limiting
        await new Promise<void>(resolve => setTimeout(resolve, 100));
      } catch {
        results.push({
          phoneNumber: recipient.phoneNumber,
          customerId: recipient.customerId,
          success: false,
          error: 'Failed to send SMS'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log('Bulk SMS results:', {
      total: results.length,
      success: successCount,
      failed: failureCount,
      sentBy: 'system',
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

export const getSMSStatsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    // In a real implementation, this would query the database
    // For now, return mock statistics
    return {
      totalSent: 1250,
      totalDelivered: 1180,
      totalFailed: 70,
      deliveryRate: 94.4,
      lastWeekSent: 180,
      thisMonthSent: 720,
      byType: {
        debt: { sent: 450, delivered: 425, failed: 25 },
        payment: { sent: 380, delivered: 365, failed: 15 },
        receipt: { sent: 220, delivered: 210, failed: 10 },
        reminder: { sent: 150, delivered: 140, failed: 10 },
        general: { sent: 50, delivered: 40, failed: 10 }
      }
    };
  });