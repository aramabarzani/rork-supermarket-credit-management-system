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
}

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  paymentDate: string;
  receivedBy: string;
  receivedByName: string;
  notes?: string;
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
}