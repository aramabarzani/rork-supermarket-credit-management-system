export interface LoyaltyPoints {
  id: string;
  customerId: string;
  customerName: string;
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: string;
  updatedAt?: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus';
  points: number;
  reason: string;
  relatedId?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  nameKurdish: string;
  description: string;
  descriptionKurdish: string;
  pointsCost: number;
  category: 'discount' | 'product' | 'service' | 'cashback';
  value: number;
  isActive: boolean;
  expiresAt?: string;
  imageUrl?: string;
  termsAndConditions?: string;
}

export interface LoyaltyRedemption {
  id: string;
  customerId: string;
  customerName: string;
  rewardId: string;
  rewardName: string;
  pointsUsed: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  redeemedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  completedAt?: string;
  notes?: string;
}

export interface LoyaltySettings {
  id: string;
  enabled: boolean;
  pointsPerDinar: number;
  minimumPurchaseForPoints: number;
  pointsExpiryDays: number;
  tiers: {
    bronze: { minPoints: number; multiplier: number };
    silver: { minPoints: number; multiplier: number };
    gold: { minPoints: number; multiplier: number };
    platinum: { minPoints: number; multiplier: number };
  };
  bonusEvents: {
    birthday: number;
    anniversary: number;
    referral: number;
  };
}
