export interface Debt {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  remainingAmount: number;
  description: string;
  category: string; // مۆری قەرز (موبایل، نووت، خۆراک...)
  notes?: string; // تێبینی تایبەتی
  createdAt: string;
  createdBy: string;
  createdByName: string;
  status: 'active' | 'paid' | 'partial';
  dueDate?: string;
  receiptNumber?: string; // ژمارەی وەسڵ
  city?: string; // شار
  location?: string; // شوێن
  isVIP?: boolean; // قەرزی کڕیاری VIP
  updatedAt?: string;
  updatedBy?: string;
  updatedByName?: string;
}

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  paymentDate: string;
  receivedBy: string;
  receivedByName: string;
  notes?: string;
  status: 'completed' | 'refunded' | 'cancelled';
  refundedAt?: string;
  refundedBy?: string;
  refundedByName?: string;
  refundReason?: string;
  updatedAt?: string;
  updatedBy?: string;
  updatedByName?: string;
}

export interface DebtSummary {
  totalDebts: number;
  totalPaid: number;
  totalRemaining: number;
  activeDebtsCount: number;
  paidDebtsCount: number;
}

export interface SearchFilters {
  searchText?: string;
  receiptNumber?: string;
  customerId?: string;
  employeeId?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'paid' | 'partial' | 'all';
  paymentStatus?: 'complete' | 'incomplete' | 'all';
  sortBy?: 'date' | 'amount' | 'customer' | 'category';
  sortOrder?: 'asc' | 'desc';
  city?: string;
  location?: string;
  isVIP?: boolean;
  vipLevel?: number;
  amountRange?: 'small' | 'medium' | 'large';
}

export interface PaymentFilters {
  searchText?: string;
  receiptNumber?: string;
  customerId?: string;
  employeeId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'customer';
  sortOrder?: 'asc' | 'desc';
  city?: string;
  location?: string;
  isVIP?: boolean;
  vipLevel?: number;
  amountRange?: 'small' | 'medium' | 'large';
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  type: 'debt' | 'payment';
  relatedId: string; // debtId or paymentId
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  createdBy: string;
  createdByName: string;
  companyInfo: CompanyInfo;
  notes?: string;
}

export interface CompanyInfo {
  name: string;
  logo?: string;
  phone?: string;
  address?: string;
  email?: string;
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  headerTemplate: string;
  bodyTemplate: string;
  footerTemplate: string;
  styles: ReceiptStyles;
  isDefault: boolean;
}

export interface ReceiptStyles {
  fontSize: number;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  borderColor: string;
  logoSize: { width: number; height: number };
}

export interface ReceiptFilters {
  searchText?: string;
  receiptNumber?: string;
  customerId?: string;
  employeeId?: string;
  type?: 'debt' | 'payment' | 'all';
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'customer' | 'receiptNumber';
  sortOrder?: 'asc' | 'desc';
  minAmount?: number;
  maxAmount?: number;
  amountRange?: 'small' | 'medium' | 'large';
}

export interface DebtHistory {
  id: string;
  debtId: string;
  action: 'created' | 'updated' | 'deleted' | 'split' | 'transferred' | 'payment_added' | 'payment_updated' | 'payment_deleted' | 'payment_refunded';
  performedBy: string;
  performedByName: string;
  performedAt: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  notes?: string;
  metadata?: {
    transferredTo?: string;
    transferredToName?: string;
    splitInto?: string[];
    paymentId?: string;
    [key: string]: any;
  };
}

export interface PaymentPlan {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  installmentAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  nextPaymentDate: string;
  completedPayments: number;
  totalInstallments: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
  createdByName: string;
  notes?: string;
}

export interface PaymentReminder {
  id: string;
  customerId: string;
  customerName: string;
  debtId: string;
  reminderDate: string;
  reminderTime: string;
  message: string;
  type: 'sms' | 'whatsapp' | 'push' | 'email';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  customTime?: string;
}

export interface AutomaticNotificationSettings {
  id: string;
  enabled: boolean;
  overdueNotifications: {
    enabled: boolean;
    daysBeforeDue: number[];
    daysAfterDue: number[];
    channels: ('sms' | 'whatsapp' | 'push' | 'email')[];
    messageTemplate: string;
  };
  paymentConfirmations: {
    enabled: boolean;
    channels: ('sms' | 'whatsapp' | 'push' | 'email')[];
    messageTemplate: string;
  };
  monthlyReports: {
    enabled: boolean;
    dayOfMonth: number;
    channels: ('email' | 'push')[];
    recipients: string[];
  };
  customReminders: {
    enabled: boolean;
    defaultTime: string;
    allowCustomerCustomization: boolean;
  };
}