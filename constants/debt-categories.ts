export const DEBT_CATEGORIES = [
  { id: 'mobile', name: 'موبایل', icon: '📱' },
  { id: 'food', name: 'خۆراک', icon: '🍽️' },
  { id: 'grocery', name: 'نووت', icon: '🛒' },
  { id: 'electronics', name: 'ئەلیکترۆنی', icon: '💻' },
  { id: 'clothing', name: 'جل و بەرگ', icon: '👕' },
  { id: 'medicine', name: 'دەرمان', icon: '💊' },
  { id: 'fuel', name: 'سووتەمەنی', icon: '⛽' },
  { id: 'services', name: 'خزمەتگوزاری', icon: '🔧' },
  { id: 'other', name: 'هیتر', icon: '📦' },
] as const;

export type DebtCategoryId = typeof DEBT_CATEGORIES[number]['id'];

export const getDebtCategoryById = (id: string) => {
  return DEBT_CATEGORIES.find(category => category.id === id) || DEBT_CATEGORIES[DEBT_CATEGORIES.length - 1];
};

export const DEBT_FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
} as const;

export const DEBT_FILTER_LABELS = {
  [DEBT_FILTERS.ALL]: 'هەموو قەرزەکان',
  [DEBT_FILTERS.ACTIVE]: 'قەرزی چالاک',
  [DEBT_FILTERS.PAID]: 'قەرزی دراوەتەوە',
  [DEBT_FILTERS.PARTIAL]: 'قەرزی بەشی',
  [DEBT_FILTERS.OVERDUE]: 'قەرزی دواکەوتوو',
} as const;

export const AMOUNT_RANGES = [
  { id: 'all', label: 'هەموو بڕەکان', min: 0, max: Infinity },
  { id: 'small', label: 'کەم (< ١٠٠,٠٠٠)', min: 0, max: 100000 },
  { id: 'medium', label: 'ناوەند (١٠٠,٠٠٠ - ٥٠٠,٠٠٠)', min: 100000, max: 500000 },
  { id: 'large', label: 'زۆر (> ٥٠٠,٠٠٠)', min: 500000, max: Infinity },
] as const;