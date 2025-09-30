import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

// Automated notification triggers
export const triggerDebtNotificationProcedure = protectedProcedure
  .input(z.object({
    customerId: z.string(),
    customerName: z.string(),
    debtAmount: z.number(),
    debtId: z.string(),
    channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app'])),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    whatsappNumber: z.string().optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const notifications = [];
      
      // Generate notification message
      const message = `بەڕێز ${input.customerName}، قەرزتان ${input.debtAmount.toLocaleString()} دینارە. تکایە پارەدان بکەن.`;
      
      // Send notifications through selected channels
      for (const channel of input.channels) {
        let result = { success: false, messageId: '', error: '' };
        
        switch (channel) {
          case 'sms':
            if (input.phoneNumber) {
              // Simulate SMS sending
              await new Promise<void>(resolve => setTimeout(resolve, 500));
              result = {
                success: Math.random() > 0.1,
                messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                error: Math.random() > 0.1 ? '' : 'SMS sending failed'
              };
            }
            break;
            
          case 'email':
            if (input.email) {
              // Simulate email sending
              await new Promise<void>(resolve => setTimeout(resolve, 800));
              result = {
                success: Math.random() > 0.05,
                messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                error: Math.random() > 0.05 ? '' : 'Email sending failed'
              };
            }
            break;
            
          case 'whatsapp':
            if (input.whatsappNumber) {
              // Simulate WhatsApp sending
              await new Promise<void>(resolve => setTimeout(resolve, 600));
              result = {
                success: Math.random() > 0.08,
                messageId: `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                error: Math.random() > 0.08 ? '' : 'WhatsApp sending failed'
              };
            }
            break;
            
          case 'in_app':
            // Always successful for in-app notifications
            result = {
              success: true,
              messageId: `inapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              error: ''
            };
            break;
        }
        
        notifications.push({
          channel,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
      }
      
      console.log('Automated debt notification sent:', {
        customerId: input.customerId,
        debtId: input.debtId,
        debtAmount: input.debtAmount,
        channels: input.channels,
        results: notifications,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        notifications,
        summary: {
          total: notifications.length,
          successful: notifications.filter(n => n.success).length,
          failed: notifications.filter(n => !n.success).length
        }
      };
    } catch (error) {
      console.error('Automated debt notification error:', error);
      return {
        success: false,
        error: 'Failed to send automated notifications'
      };
    }
  });

export const triggerPaymentNotificationProcedure = protectedProcedure
  .input(z.object({
    customerId: z.string(),
    customerName: z.string(),
    paymentAmount: z.number(),
    paymentId: z.string(),
    channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app'])),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    whatsappNumber: z.string().optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const notifications = [];
      
      // Generate notification message
      const message = `بەڕێز ${input.customerName}، پارەدانی ${input.paymentAmount.toLocaleString()} دینار وەرگیرا. سوپاس.`;
      
      // Send notifications through selected channels
      for (const channel of input.channels) {
        let result = { success: false, messageId: '', error: '' };
        
        switch (channel) {
          case 'sms':
            if (input.phoneNumber) {
              await new Promise<void>(resolve => setTimeout(resolve, 500));
              result = {
                success: Math.random() > 0.1,
                messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                error: Math.random() > 0.1 ? '' : 'SMS sending failed'
              };
            }
            break;
            
          case 'email':
            if (input.email) {
              await new Promise<void>(resolve => setTimeout(resolve, 800));
              result = {
                success: Math.random() > 0.05,
                messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                error: Math.random() > 0.05 ? '' : 'Email sending failed'
              };
            }
            break;
            
          case 'whatsapp':
            if (input.whatsappNumber) {
              await new Promise<void>(resolve => setTimeout(resolve, 600));
              result = {
                success: Math.random() > 0.08,
                messageId: `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                error: Math.random() > 0.08 ? '' : 'WhatsApp sending failed'
              };
            }
            break;
            
          case 'in_app':
            result = {
              success: true,
              messageId: `inapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              error: ''
            };
            break;
        }
        
        notifications.push({
          channel,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
      }
      
      console.log('Automated payment notification sent:', {
        customerId: input.customerId,
        paymentId: input.paymentId,
        paymentAmount: input.paymentAmount,
        channels: input.channels,
        results: notifications,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        notifications,
        summary: {
          total: notifications.length,
          successful: notifications.filter(n => n.success).length,
          failed: notifications.filter(n => !n.success).length
        }
      };
    } catch (error) {
      console.error('Automated payment notification error:', error);
      return {
        success: false,
        error: 'Failed to send automated notifications'
      };
    }
  });

export const triggerHighDebtWarningProcedure = protectedProcedure
  .input(z.object({
    customerId: z.string(),
    customerName: z.string(),
    totalDebt: z.number(),
    threshold: z.number(),
    channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app'])),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    whatsappNumber: z.string().optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const notifications = [];
      
      // Generate warning message
      const message = `⚠️ ئاگاداری: بەڕێز ${input.customerName}، کۆی قەرزتان ${input.totalDebt.toLocaleString()} دینارە کە لە سنووری ${input.threshold.toLocaleString()} دینار زیاترە. تکایە پارەدان بکەن.`;
      
      // Send notifications through selected channels
      for (const channel of input.channels) {
        let result = { success: false, messageId: '', error: '' };
        
        switch (channel) {
          case 'sms':
            if (input.phoneNumber) {
              await new Promise<void>(resolve => setTimeout(resolve, 500));
              result = {
                success: Math.random() > 0.1,
                messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                error: Math.random() > 0.1 ? '' : 'SMS sending failed'
              };
            }
            break;
            
          case 'email':
            if (input.email) {
              await new Promise<void>(resolve => setTimeout(resolve, 800));
              result = {
                success: Math.random() > 0.05,
                messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                error: Math.random() > 0.05 ? '' : 'Email sending failed'
              };
            }
            break;
            
          case 'whatsapp':
            if (input.whatsappNumber) {
              await new Promise<void>(resolve => setTimeout(resolve, 600));
              result = {
                success: Math.random() > 0.08,
                messageId: `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                error: Math.random() > 0.08 ? '' : 'WhatsApp sending failed'
              };
            }
            break;
            
          case 'in_app':
            result = {
              success: true,
              messageId: `inapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              error: ''
            };
            break;
        }
        
        notifications.push({
          channel,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
      }
      
      console.log('High debt warning sent:', {
        customerId: input.customerId,
        totalDebt: input.totalDebt,
        threshold: input.threshold,
        channels: input.channels,
        results: notifications,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        notifications,
        summary: {
          total: notifications.length,
          successful: notifications.filter(n => n.success).length,
          failed: notifications.filter(n => !n.success).length
        }
      };
    } catch (error) {
      console.error('High debt warning error:', error);
      return {
        success: false,
        error: 'Failed to send high debt warning'
      };
    }
  });

export const triggerManagerNotificationProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['new_debt', 'new_payment', 'new_customer', 'new_employee', 'debt_50_days', 'debt_100_days', 'high_debt_alert', 'high_payment_alert', 'system_error', 'user_inactivity', 'backup_issue', 'data_overflow', 'account_locked', 'daily_summary', 'employee_activity']),
    title: z.string(),
    message: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    relatedId: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const managerId = 'manager_1';
      
      const notificationId = `mgr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Manager notification triggered:', {
        notificationId,
        managerId,
        type: input.type,
        title: input.title,
        priority: input.priority,
        relatedId: input.relatedId,
        metadata: input.metadata,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        notificationId,
        managerId
      };
    } catch (error) {
      console.error('Manager notification error:', error);
      return {
        success: false,
        error: 'Failed to send manager notification'
      };
    }
  });

export const getAutomationSettingsProcedure = protectedProcedure
  .query(async () => {
    return {
      debtNotifications: {
        enabled: true,
        triggerAmount: 50000,
        channels: ['sms', 'whatsapp'] as const,
        delay: 0
      },
      paymentNotifications: {
        enabled: true,
        channels: ['sms', 'email'] as const,
        delay: 300
      },
      highDebtWarnings: {
        enabled: true,
        threshold: 500000,
        channels: ['sms', 'email', 'whatsapp'] as const,
        frequency: 'weekly' as const
      },
      managerAlerts: {
        enabled: true,
        highDebtThreshold: 1000000,
        highPaymentThreshold: 500000,
        channels: ['in_app', 'email'] as const,
        workingHours: {
          start: '08:00',
          end: '18:00'
        }
      },
      reminderSchedule: {
        enabled: true,
        frequency: 'daily' as const,
        time: '10:00',
        channels: ['sms', 'whatsapp'] as const
      },
      overdueAlerts: {
        enabled: true,
        days50Enabled: true,
        days100Enabled: true,
        channels: ['sms', 'whatsapp', 'in_app'] as const
      },
      customerAlerts: {
        enabled: true,
        newCustomerAlert: true,
        newEmployeeAlert: true,
        channels: ['in_app', 'email'] as const
      },
      systemAlerts: {
        enabled: true,
        errorAlerts: true,
        inactivityAlerts: true,
        backupAlerts: true,
        dataOverflowAlerts: true,
        accountLockAlerts: true,
        channels: ['in_app', 'email', 'sms'] as const
      }
    };
  });

export const updateAutomationSettingsProcedure = protectedProcedure
  .input(z.object({
    debtNotifications: z.object({
      enabled: z.boolean(),
      triggerAmount: z.number(),
      channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app'])),
      delay: z.number()
    }).optional(),
    paymentNotifications: z.object({
      enabled: z.boolean(),
      channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app'])),
      delay: z.number()
    }).optional(),
    highDebtWarnings: z.object({
      enabled: z.boolean(),
      threshold: z.number(),
      channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app'])),
      frequency: z.enum(['daily', 'weekly', 'monthly'])
    }).optional(),
    managerAlerts: z.object({
      enabled: z.boolean(),
      highDebtThreshold: z.number(),
      highPaymentThreshold: z.number().optional(),
      channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app'])),
      workingHours: z.object({
        start: z.string(),
        end: z.string()
      })
    }).optional(),
    reminderSchedule: z.object({
      enabled: z.boolean(),
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      time: z.string(),
      channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app']))
    }).optional(),
    overdueAlerts: z.object({
      enabled: z.boolean(),
      days50Enabled: z.boolean(),
      days100Enabled: z.boolean(),
      channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app']))
    }).optional(),
    customerAlerts: z.object({
      enabled: z.boolean(),
      newCustomerAlert: z.boolean(),
      newEmployeeAlert: z.boolean(),
      channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app']))
    }).optional(),
    systemAlerts: z.object({
      enabled: z.boolean(),
      errorAlerts: z.boolean(),
      inactivityAlerts: z.boolean(),
      backupAlerts: z.boolean(),
      dataOverflowAlerts: z.boolean(),
      accountLockAlerts: z.boolean(),
      channels: z.array(z.enum(['sms', 'email', 'whatsapp', 'viber', 'push', 'in_app']))
    }).optional()
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('Automation settings updated:', {
        settings: input,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Automation settings updated successfully'
      };
    } catch (error) {
      console.error('Update automation settings error:', error);
      return {
        success: false,
        error: 'Failed to update automation settings'
      };
    }
  });