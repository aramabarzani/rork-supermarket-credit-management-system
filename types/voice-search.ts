export type VoiceSearchType = 
  | 'customer'
  | 'employee'
  | 'debt'
  | 'payment'
  | 'phone'
  | 'date'
  | 'amount'
  | 'general';

export interface VoiceSearchResult {
  text: string;
  language: string;
  confidence: number;
  searchType?: VoiceSearchType;
}

export interface VoiceInputData {
  type: 'debt' | 'payment' | 'customer';
  data: Record<string, any>;
  confidence: number;
}

export interface SearchFilter {
  customerName?: string;
  employeeName?: string;
  phoneNumber?: string;
  debtNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  debtDurationFrom?: number;
  debtDurationTo?: number;
  language?: 'ku' | 'en';
}

export interface AdvancedSearchParams extends SearchFilter {
  searchTerm?: string;
  sortBy?: 'date' | 'amount' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
