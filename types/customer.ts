export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  group: string; // گروپی کڕیار
  rating: number; // پلەبەندی کڕیار (1-5)
  totalDebt: number;
  totalPaid: number;
  lastPaymentDate?: string;
  lastDebtDate?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  city?: string; // شار
  location?: string; // شوێن
  isVIP?: boolean; // کڕیاری VIP
  vipLevel?: number; // پلەی VIP (1-5)
  usageDuration?: number; // ماوەی بەکارهێنان بە ڕۆژ
  qrCode?: CustomerQRCode; // QR Code زانیاری
  blockedAt?: string;
  blockedBy?: string;
  blockedReason?: string;
  documents?: CustomerDocument[];
  connections?: CustomerConnection[];
  specialFeatures?: string[];
}

export interface CustomerQRCode {
  id: string;
  customerId: string;
  code: string; // کۆدی یەکتا
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  expiresAt?: string; // بەرواری بەسەرچوون
  usageCount: number; // ژمارەی بەکارهێنان
  lastUsedAt?: string;
}

export interface CustomerAnalytics {
  inactiveCustomers: Customer[];
  newCustomersThisMonth: Customer[];
  highDebtCustomersThisMonth: Customer[];
  bestPayingCustomersThisMonth: Customer[];
  highestDebtCustomersYearly: Customer[];
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newThisMonth: number;
  totalDebtAmount: number;
  totalPaidAmount: number;
  averageDebtPerCustomer: number;
}

export interface MonthlyCustomerReport {
  customerId: string;
  customerName: string;
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
  transactionCount: number;
  lastActivity: string;
}

export interface YearlyCustomerReport {
  customerId: string;
  customerName: string;
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
  monthlyBreakdown: {
    month: string;
    debt: number;
    paid: number;
  }[];
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  name: string;
  type: 'image' | 'pdf' | 'document';
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  notes?: string;
}

export interface CustomerConnection {
  id: string;
  customerId: string;
  connectedCustomerId: string;
  connectedCustomerName: string;
  relationship: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface CustomerHistory {
  id: string;
  customerId: string;
  action: 'created' | 'updated' | 'blocked' | 'unblocked' | 'document_added' | 'document_removed' | 'connection_added' | 'connection_removed' | 'feature_added' | 'feature_removed' | 'rating_changed';
  performedBy: string;
  performedByName: string;
  performedAt: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CustomerFilters {
  searchText?: string;
  group?: string;
  rating?: number;
  status?: 'active' | 'inactive' | 'blocked' | 'all';
  city?: string;
  location?: string;
  isVIP?: boolean;
  vipLevel?: number;
  minUsageDuration?: number;
  maxUsageDuration?: number;
  minTotalDebt?: number;
  maxTotalDebt?: number;
  minTotalPaid?: number;
  maxTotalPaid?: number;
  sortBy?: 'name' | 'totalDebt' | 'totalPaid' | 'createdAt' | 'usageDuration';
  sortOrder?: 'asc' | 'desc';
}