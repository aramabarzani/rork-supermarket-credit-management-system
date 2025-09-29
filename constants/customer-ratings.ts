export const CUSTOMER_RATINGS = [
  {
    id: 'excellent',
    name: 'نایاب',
    description: 'باشترین پارەدان، هەمیشە لە کاتی خۆیدا پارە دەداتەوە',
    color: '#10B981',
    priority: 5,
  },
  {
    id: 'good',
    name: 'باش',
    description: 'پارەدانی باش، زۆرجار لە کاتی خۆیدا پارە دەداتەوە',
    color: '#3B82F6',
    priority: 4,
  },
  {
    id: 'average',
    name: 'ناوەند',
    description: 'پارەدانی ئاسایی، هەندێکجار دواکەوتن هەیە',
    color: '#F59E0B',
    priority: 3,
  },
  {
    id: 'poor',
    name: 'خراپ',
    description: 'پارەدانی خراپ، زۆرجار دواکەوتن هەیە',
    color: '#EF4444',
    priority: 2,
  },
  {
    id: 'debtor',
    name: 'خاوەن قەرز',
    description: 'قەرزی زۆری هەیە و کەم پارە دەداتەوە',
    color: '#DC2626',
    priority: 1,
  },
  {
    id: 'new',
    name: 'نوێ',
    description: 'کڕیاری نوێ، هێشتا مێژووی پارەدانی نییە',
    color: '#6B7280',
    priority: 0,
  },
] as const;

export type CustomerRatingId = typeof CUSTOMER_RATINGS[number]['id'];

export const getCustomerRatingById = (id: string) => {
  return CUSTOMER_RATINGS.find(rating => rating.id === id);
};

export const getCustomerRatingColor = (id: string) => {
  const rating = getCustomerRatingById(id);
  return rating?.color || '#6B7280';
};

export const getCustomerRatingName = (id: string) => {
  const rating = getCustomerRatingById(id);
  return rating?.name || 'نوێ';
};

export const calculateCustomerRating = (
  totalDebts: number,
  totalPaid: number,
  onTimePayments: number,
  latePayments: number,
  activeDebtsCount: number
): CustomerRatingId => {
  // If new customer with no payment history
  if (totalPaid === 0 && totalDebts === 0) {
    return 'new';
  }

  // Calculate payment ratio
  const paymentRatio = totalDebts > 0 ? totalPaid / totalDebts : 0;
  const totalPayments = onTimePayments + latePayments;
  const onTimeRatio = totalPayments > 0 ? onTimePayments / totalPayments : 0;

  // Heavy debtor with low payment ratio
  if (activeDebtsCount > 5 && paymentRatio < 0.3) {
    return 'debtor';
  }

  // Excellent: High payment ratio and mostly on-time payments
  if (paymentRatio >= 0.8 && onTimeRatio >= 0.9) {
    return 'excellent';
  }

  // Good: Good payment ratio and decent on-time payments
  if (paymentRatio >= 0.6 && onTimeRatio >= 0.7) {
    return 'good';
  }

  // Average: Moderate payment behavior
  if (paymentRatio >= 0.4 && onTimeRatio >= 0.5) {
    return 'average';
  }

  // Poor: Low payment ratio or many late payments
  return 'poor';
};