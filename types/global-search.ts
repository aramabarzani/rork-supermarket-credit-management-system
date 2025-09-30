export type SearchEntityType = 'customer' | 'employee' | 'debt' | 'payment' | 'all';

export type CustomerType = 'VIP' | 'Normal' | 'all';

export interface GlobalSearchFilters {
  query?: string;
  entityType?: SearchEntityType;
  customerName?: string;
  customerPhone?: string;
  debtNumber?: string;
  paymentNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  customerType?: CustomerType;
  employeeRole?: string;
  location?: string;
  city?: string;
}

export interface SearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  description?: string;
  amount?: number;
  date?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface GlobalSearchResponse {
  results: SearchResult[];
  total: number;
  filters: GlobalSearchFilters;
}

export interface QuickSearchSuggestion {
  id: string;
  text: string;
  type: SearchEntityType;
  icon?: string;
}
