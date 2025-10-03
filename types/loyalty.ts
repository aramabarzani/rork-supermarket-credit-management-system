export interface LoyaltyProgram {
  id: string;
  name: string;
  nameKurdish: string;
  description: string;
  descriptionKurdish: string;
  pointsPerDinar: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyReward {
  id: string;
  programId: string;
  name: string;
  nameKurdish: string;
  description: string;
  descriptionKurdish: string;
  pointsRequired: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerLoyaltyPoints {
  id: string;
  customerId: string;
  customerName: string;
  programId: string;
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinedAt: string;
  lastActivityAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  customerName: string;
  programId: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  reasonKurdish: string;
  relatedDebtId?: string;
  relatedPaymentId?: string;
  relatedRewardId?: string;
  createdBy: string;
  createdAt: string;
}

export interface LoyaltyTier {
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  nameKurdish: string;
  minPoints: number;
  benefits: string[];
  benefitsKurdish: string[];
  color: string;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'bronze',
    nameKurdish: 'برۆنز',
    minPoints: 0,
    benefits: ['1x points on purchases', 'Basic rewards'],
    benefitsKurdish: ['١x خاڵ لەسەر کڕین', 'خەڵاتی بنەڕەتی'],
    color: '#CD7F32',
  },
  {
    name: 'silver',
    nameKurdish: 'زیو',
    minPoints: 1000,
    benefits: ['1.5x points on purchases', 'Priority support', 'Exclusive rewards'],
    benefitsKurdish: ['١.٥x خاڵ لەسەر کڕین', 'پشتگیری تایبەت', 'خەڵاتی تایبەت'],
    color: '#C0C0C0',
  },
  {
    name: 'gold',
    nameKurdish: 'زێڕ',
    minPoints: 5000,
    benefits: ['2x points on purchases', 'VIP support', 'Premium rewards', 'Birthday bonus'],
    benefitsKurdish: ['٢x خاڵ لەسەر کڕین', 'پشتگیری VIP', 'خەڵاتی پریمیەم', 'بۆنسی ڕۆژی لەدایکبوون'],
    color: '#FFD700',
  },
  {
    name: 'platinum',
    nameKurdish: 'پلاتینیوم',
    minPoints: 10000,
    benefits: ['3x points on purchases', 'Dedicated account manager', 'Exclusive events', 'Special discounts'],
    benefitsKurdish: ['٣x خاڵ لەسەر کڕین', 'بەڕێوەبەری هەژماری تایبەت', 'بۆنەی تایبەت', 'داشکاندنی تایبەت'],
    color: '#E5E4E2',
  },
];
