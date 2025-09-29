import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import type { EmailProvider, EmailAttachment } from '@/types/notification';

// Mock Email provider - replace with actual email service (SendGrid, AWS SES, etc.)
const mockEmailProvider: EmailProvider = {
  async sendEmail(to: string, subject: string, body: string, attachments?: EmailAttachment[]) {
    console.log(`Email sent to ${to}: ${subject}`);
    console.log('Body:', body);
    if (attachments?.length) {
      console.log('Attachments:', attachments.map(a => a.filename));
    }
    
    // Simulate API call delay
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    
    // Simulate success/failure
    const success = Math.random() > 0.05; // 95% success rate
    
    if (success) {
      return {
        success: true,
        messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Failed to send email'
      };
    }
  }
};

export const sendEmailProcedure = protectedProcedure
  .input(z.object({
    to: z.string().email('Valid email is required'),
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
    customerId: z.string().optional(),
    type: z.enum(['debt', 'payment', 'receipt', 'reminder', 'general']).optional(),
    attachments: z.array(z.object({
      filename: z.string(),
      content: z.string(), // base64 encoded
      contentType: z.string()
    })).optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const attachments: EmailAttachment[] | undefined = input.attachments?.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType
      }));

      const result = await mockEmailProvider.sendEmail(
        input.to, 
        input.subject, 
        input.body, 
        attachments
      );
      
      // Log the email attempt
      console.log('Email attempt:', {
        to: input.to,
        subject: input.subject,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        sentBy: 'system',
        customerId: input.customerId,
        type: input.type,
        attachmentCount: attachments?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  });

export const sendBulkEmailProcedure = protectedProcedure
  .input(z.object({
    recipients: z.array(z.object({
      email: z.string().email(),
      customerId: z.string().optional(),
      variables: z.record(z.string(), z.any()).optional()
    })),
    subjectTemplate: z.string(),
    bodyTemplate: z.string(),
    type: z.enum(['debt', 'payment', 'receipt', 'reminder', 'general']).optional(),
    attachments: z.array(z.object({
      filename: z.string(),
      content: z.string(), // base64 encoded
      contentType: z.string()
    })).optional()
  }))
  .mutation(async ({ input }) => {
    const results = [];
    
    const attachments: EmailAttachment[] | undefined = input.attachments?.map(att => ({
      filename: att.filename,
      content: Buffer.from(att.content, 'base64'),
      contentType: att.contentType
    }));
    
    for (const recipient of input.recipients) {
      try {
        // Replace variables in templates
        let subject = input.subjectTemplate;
        let body = input.bodyTemplate;
        
        if (recipient.variables) {
          Object.entries(recipient.variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            subject = subject.replace(regex, String(value));
            body = body.replace(regex, String(value));
          });
        }
        
        const result = await mockEmailProvider.sendEmail(
          recipient.email, 
          subject, 
          body, 
          attachments
        );
        
        results.push({
          email: recipient.email,
          customerId: recipient.customerId,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
        
        // Small delay between emails to avoid rate limiting
        await new Promise<void>(resolve => setTimeout(resolve, 200));
      } catch {
        results.push({
          email: recipient.email,
          customerId: recipient.customerId,
          success: false,
          error: 'Failed to send email'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log('Bulk email results:', {
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

export const sendReceiptEmailProcedure = protectedProcedure
  .input(z.object({
    to: z.string().email(),
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
      const subject = `وەسڵی ${input.receiptData.type === 'debt' ? 'قەرز' : 'پارەدان'} - ${input.receiptData.receiptId}`;
      
      const body = `
بەڕێز ${input.customerName}،

وەسڵی ${input.receiptData.type === 'debt' ? 'قەرز' : 'پارەدان'}:

ژمارەی وەسڵ: ${input.receiptData.receiptId}
بڕ: ${input.receiptData.amount.toLocaleString()} دینار
جۆر: ${input.receiptData.type === 'debt' ? 'قەرز' : 'پارەدان'}
بەروار: ${new Date(input.receiptData.date).toLocaleDateString('ku')}
${input.receiptData.description ? `وەسف: ${input.receiptData.description}` : ''}

سوپاس بۆ هاوکاریتان.

سیستەمی بەڕێوەبردنی قەرزی سوپەرمارکێت
      `.trim();

      const result = await mockEmailProvider.sendEmail(input.to, subject, body);
      
      console.log('Receipt email sent:', {
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
      console.error('Receipt email error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  });

export const getEmailStatsProcedure = protectedProcedure
  .query(async () => {
    // In a real implementation, this would query the database
    return {
      totalSent: 890,
      totalDelivered: 845,
      totalFailed: 45,
      deliveryRate: 94.9,
      lastWeekSent: 125,
      thisMonthSent: 520,
      byType: {
        debt: { sent: 320, delivered: 305, failed: 15 },
        payment: { sent: 280, delivered: 270, failed: 10 },
        receipt: { sent: 180, delivered: 175, failed: 5 },
        reminder: { sent: 90, delivered: 80, failed: 10 },
        general: { sent: 20, delivered: 15, failed: 5 }
      }
    };
  });