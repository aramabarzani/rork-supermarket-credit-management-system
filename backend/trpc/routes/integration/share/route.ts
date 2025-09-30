import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const shareViaEmailProcedure = protectedProcedure
  .input(z.object({
    recipients: z.array(z.string()),
    subject: z.string(),
    body: z.string(),
    attachments: z.array(z.object({
      name: z.string(),
      data: z.string(),
      mimeType: z.string(),
    })).optional(),
  }))
  .mutation(async ({ input }) => {
    const { recipients } = input;
    
    console.log('Sending email to:', recipients);
    
    return {
      success: true,
      platform: 'email' as const,
      recipients,
      messageId: `email_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  });

export const shareViaWhatsAppProcedure = protectedProcedure
  .input(z.object({
    recipients: z.array(z.string()),
    message: z.string(),
    attachments: z.array(z.object({
      name: z.string(),
      data: z.string(),
      mimeType: z.string(),
    })).optional(),
  }))
  .mutation(async ({ input }) => {
    const { recipients } = input;
    
    console.log('Sending WhatsApp message to:', recipients);
    
    return {
      success: true,
      platform: 'whatsapp' as const,
      recipients,
      messageId: `whatsapp_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  });

export const shareViaTelegramProcedure = protectedProcedure
  .input(z.object({
    chatId: z.string(),
    message: z.string(),
    attachments: z.array(z.object({
      name: z.string(),
      data: z.string(),
      mimeType: z.string(),
    })).optional(),
  }))
  .mutation(async ({ input }) => {
    const { chatId } = input;
    
    console.log('Sending Telegram message to:', chatId);
    
    return {
      success: true,
      platform: 'telegram' as const,
      recipients: [chatId],
      messageId: `telegram_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  });

export const shareViaSMSProcedure = protectedProcedure
  .input(z.object({
    recipients: z.array(z.string()),
    message: z.string(),
  }))
  .mutation(async ({ input }) => {
    const { recipients } = input;
    
    console.log('Sending SMS to:', recipients);
    
    return {
      success: true,
      platform: 'sms' as const,
      recipients,
      messageId: `sms_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  });

export const shareReceiptProcedure = protectedProcedure
  .input(z.object({
    receiptId: z.string(),
    platform: z.enum(['email', 'whatsapp', 'sms']),
    recipient: z.string(),
  }))
  .mutation(async ({ input }) => {
    const { receiptId, platform, recipient } = input;
    
    console.log(`Sharing receipt ${receiptId} via ${platform} to ${recipient}`);
    
    return {
      success: true,
      platform,
      recipients: [recipient],
      messageId: `${platform}_receipt_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  });

export const shareReportProcedure = protectedProcedure
  .input(z.object({
    reportType: z.enum(['monthly', 'yearly', 'dashboard', 'custom']),
    platform: z.enum(['email', 'whatsapp', 'telegram']),
    recipients: z.array(z.string()),
    format: z.enum(['pdf', 'excel']),
    data: z.any(),
  }))
  .mutation(async ({ input }) => {
    const { reportType, platform, recipients } = input;
    
    console.log(`Sharing ${reportType} report via ${platform} to:`, recipients);
    
    return {
      success: true,
      platform,
      recipients,
      messageId: `${platform}_report_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  });

export const scheduledShareProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['daily', 'weekly', 'monthly']),
    platform: z.enum(['email', 'whatsapp', 'telegram']),
    recipients: z.array(z.string()),
    reportType: z.enum(['monthly', 'yearly', 'dashboard']),
    enabled: z.boolean(),
  }))
  .mutation(async ({ input }) => {
    console.log('Setting up scheduled share:', input);
    
    return {
      success: true,
      scheduleId: `schedule_${Date.now()}`,
      ...input,
    };
  });
