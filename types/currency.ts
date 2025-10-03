export interface Currency {
  code: string;
  name: string;
  nameKurdish: string;
  symbol: string;
  exchangeRate: number;
  isBaseCurrency: boolean;
  isActive: boolean;
  lastUpdated: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
  source?: string;
  createdAt: string;
}

export interface MultiCurrencyTransaction {
  id: string;
  originalCurrency: string;
  originalAmount: number;
  baseCurrency: string;
  baseAmount: number;
  exchangeRate: number;
  transactionType: 'debt' | 'payment' | 'expense' | 'income';
  relatedId: string;
  date: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: 'IQD',
    name: 'Iraqi Dinar',
    nameKurdish: 'دینار',
    symbol: 'د.ع',
    exchangeRate: 1,
    isBaseCurrency: true,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    code: 'USD',
    name: 'US Dollar',
    nameKurdish: 'دۆلار',
    symbol: '$',
    exchangeRate: 0.00076,
    isBaseCurrency: false,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    code: 'EUR',
    name: 'Euro',
    nameKurdish: 'یۆرۆ',
    symbol: '€',
    exchangeRate: 0.00070,
    isBaseCurrency: false,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    code: 'TRY',
    name: 'Turkish Lira',
    nameKurdish: 'لیرەی تورکی',
    symbol: '₺',
    exchangeRate: 0.021,
    isBaseCurrency: false,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
];
