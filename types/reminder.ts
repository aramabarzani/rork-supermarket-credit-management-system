export interface PaymentReminder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  debtId: string;
  debtAmount: number;
  remainingAmount: number;
  dueDate?: string;
  reminderType: 'sms' | 'whatsapp' | 'call' | 'in_app';
  status: 'scheduled' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  scheduledAt: string;
  sentAt?: string;
  deliveredAt?: string;
  message: string;
  messageKurdish: string;
  template?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  autoSend: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  nameKurdish: string;
  type: 'sms' | 'whatsapp';
  message: string;
  messageKurdish: string;
  variables: string[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  nameKurdish: string;
  description?: string;
  descriptionKurdish?: string;
  isActive: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  daysBefore: number[];
  time: string;
  targetCustomers: 'all' | 'overdue' | 'upcoming' | 'high_debt';
  minDebtAmount?: number;
  templateId: string;
  reminderType: 'sms' | 'whatsapp';
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderLog {
  id: string;
  reminderId: string;
  customerId: string;
  customerName: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  sentAt: string;
  deliveredAt?: string;
  cost?: number;
}

export const REMINDER_TEMPLATES = [
  {
    id: 'default_payment_reminder',
    name: 'Default Payment Reminder',
    nameKurdish: 'بیرخستنەوەی پارەدانی بنەڕەتی',
    type: 'sms' as const,
    message: 'Dear {customerName}, this is a reminder that you have an outstanding balance of {amount} IQD. Please make a payment at your earliest convenience.',
    messageKurdish: 'بەڕێز {customerName}، ئەمە بیرخستنەوەیەکە کە قەرزێکی {amount} دینارت هەیە. تکایە لە کاتی گونجاودا پارە بدەرەوە.',
    variables: ['customerName', 'amount', 'dueDate'],
    isDefault: true,
    isActive: true,
  },
  {
    id: 'overdue_reminder',
    name: 'Overdue Payment Reminder',
    nameKurdish: 'بیرخستنەوەی پارەدانی دواکەوتوو',
    type: 'sms' as const,
    message: 'Dear {customerName}, your payment of {amount} IQD is overdue. Please contact us immediately to arrange payment.',
    messageKurdish: 'بەڕێز {customerName}، پارەدانی {amount} دینارت دواکەوتووە. تکایە دەستبەجێ پەیوەندیمان پێوە بکە بۆ ڕێکخستنی پارەدان.',
    variables: ['customerName', 'amount', 'dueDate'],
    isDefault: true,
    isActive: true,
  },
  {
    id: 'upcoming_payment',
    name: 'Upcoming Payment Reminder',
    nameKurdish: 'بیرخستنەوەی پارەدانی داهاتوو',
    type: 'whatsapp' as const,
    message: 'Hello {customerName}, this is a friendly reminder that your payment of {amount} IQD is due on {dueDate}.',
    messageKurdish: 'سڵاو {customerName}، ئەمە بیرخستنەوەیەکی دۆستانەیە کە پارەدانی {amount} دینارت لە {dueDate} دەگاتە کۆتایی.',
    variables: ['customerName', 'amount', 'dueDate'],
    isDefault: true,
    isActive: true,
  },
];
