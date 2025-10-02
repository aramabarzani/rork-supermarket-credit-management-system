export interface WhatsAppConfig {
  enabled: boolean;
  apiKey?: string;
  phoneNumber?: string;
  autoSendReminders: boolean;
  reminderDays: number[];
  templates: WhatsAppTemplate[];
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  type: 'debt_reminder' | 'payment_confirmation' | 'welcome' | 'custom';
  content: string;
  variables: string[];
  enabled: boolean;
}

export interface WhatsAppMessage {
  id: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  message: string;
  templateId?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  createdBy: string;
  createdAt: string;
}

export interface SMSConfig {
  enabled: boolean;
  provider?: 'twilio' | 'nexmo' | 'local';
  apiKey?: string;
  senderId?: string;
  autoSendReminders: boolean;
  reminderDays: number[];
}

export interface SMSMessage {
  id: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  createdBy: string;
  createdAt: string;
}

export interface MessageStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  byType: Record<string, number>;
  byMonth: {
    month: string;
    sent: number;
    delivered: number;
  }[];
}
