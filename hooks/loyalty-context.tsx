import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  LoyaltyPoints, 
  LoyaltyTransaction, 
  LoyaltyReward, 
  LoyaltyRedemption,
  LoyaltySettings 
} from '@/types/loyalty';
import { safeStorage } from '@/utils/storage';
import { useAuth } from '@/hooks/auth-context';

const LOYALTY_POINTS_KEY = 'loyalty_points';
const LOYALTY_TRANSACTIONS_KEY = 'loyalty_transactions';
const LOYALTY_REWARDS_KEY = 'loyalty_rewards';
const LOYALTY_REDEMPTIONS_KEY = 'loyalty_redemptions';
const LOYALTY_SETTINGS_KEY = 'loyalty_settings';

const defaultSettings: LoyaltySettings = {
  id: 'default',
  enabled: true,
  pointsPerDinar: 1,
  minimumPurchaseForPoints: 10000,
  pointsExpiryDays: 365,
  tiers: {
    bronze: { minPoints: 0, multiplier: 1 },
    silver: { minPoints: 1000, multiplier: 1.2 },
    gold: { minPoints: 5000, multiplier: 1.5 },
    platinum: { minPoints: 10000, multiplier: 2 },
  },
  bonusEvents: {
    birthday: 100,
    anniversary: 200,
    referral: 50,
  },
};

export const [LoyaltyProvider, useLoyalty] = createContextHook(() => {
  const { user } = useAuth();
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>([]);
  const [settings, setSettings] = useState<LoyaltySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [points, trans, rew, red, sett] = await Promise.all([
        safeStorage.getItem<LoyaltyPoints[]>(LOYALTY_POINTS_KEY, []),
        safeStorage.getItem<LoyaltyTransaction[]>(LOYALTY_TRANSACTIONS_KEY, []),
        safeStorage.getItem<LoyaltyReward[]>(LOYALTY_REWARDS_KEY, []),
        safeStorage.getItem<LoyaltyRedemption[]>(LOYALTY_REDEMPTIONS_KEY, []),
        safeStorage.getItem<LoyaltySettings>(LOYALTY_SETTINGS_KEY, defaultSettings),
      ]);

      if (points) setLoyaltyPoints(points);
      if (trans) setTransactions(trans);
      if (rew) setRewards(rew);
      if (red) setRedemptions(red);
      if (sett) setSettings(sett);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePoints = useCallback(async (points: LoyaltyPoints[]) => {
    setLoyaltyPoints(points);
    await safeStorage.setItem(LOYALTY_POINTS_KEY, points);
  }, []);

  const saveTransactions = useCallback(async (trans: LoyaltyTransaction[]) => {
    setTransactions(trans);
    await safeStorage.setItem(LOYALTY_TRANSACTIONS_KEY, trans);
  }, []);

  const saveRewards = useCallback(async (rew: LoyaltyReward[]) => {
    setRewards(rew);
    await safeStorage.setItem(LOYALTY_REWARDS_KEY, rew);
  }, []);

  const saveRedemptions = useCallback(async (red: LoyaltyRedemption[]) => {
    setRedemptions(red);
    await safeStorage.setItem(LOYALTY_REDEMPTIONS_KEY, red);
  }, []);

  const saveSettings = useCallback(async (sett: LoyaltySettings) => {
    setSettings(sett);
    await safeStorage.setItem(LOYALTY_SETTINGS_KEY, sett);
  }, []);

  const getTier = useCallback((points: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
    if (points >= settings.tiers.platinum.minPoints) return 'platinum';
    if (points >= settings.tiers.gold.minPoints) return 'gold';
    if (points >= settings.tiers.silver.minPoints) return 'silver';
    return 'bronze';
  }, [settings]);

  const getCustomerPoints = useCallback((customerId: string): LoyaltyPoints | null => {
    return loyaltyPoints.find(p => p.customerId === customerId) || null;
  }, [loyaltyPoints]);

  const addPoints = useCallback(async (
    customerId: string,
    customerName: string,
    points: number,
    reason: string,
    relatedId?: string
  ) => {
    try {
      let customerLoyalty = loyaltyPoints.find(p => p.customerId === customerId);

      if (!customerLoyalty) {
        customerLoyalty = {
          id: `loyalty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          customerId,
          customerName,
          points: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          tier: 'bronze',
          createdAt: new Date().toISOString(),
        };
      }

      const tier = getTier(customerLoyalty.points);
      const multiplier = settings.tiers[tier].multiplier;
      const earnedPoints = Math.floor(points * multiplier);

      customerLoyalty.points += earnedPoints;
      customerLoyalty.totalEarned += earnedPoints;
      customerLoyalty.tier = getTier(customerLoyalty.points);
      customerLoyalty.updatedAt = new Date().toISOString();

      const updatedPoints = loyaltyPoints.some(p => p.customerId === customerId)
        ? loyaltyPoints.map(p => p.customerId === customerId ? customerLoyalty! : p)
        : [...loyaltyPoints, customerLoyalty];

      await savePoints(updatedPoints);

      const transaction: LoyaltyTransaction = {
        id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        customerName,
        type: 'earn',
        points: earnedPoints,
        reason,
        relatedId,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'system',
        createdByName: user?.name || 'سیستەم',
      };

      await saveTransactions([...transactions, transaction]);

      return customerLoyalty;
    } catch (error) {
      throw error;
    }
  }, [loyaltyPoints, transactions, settings, user, getTier, savePoints, saveTransactions]);

  const redeemPoints = useCallback(async (
    customerId: string,
    rewardId: string
  ) => {
    try {
      const customerLoyalty = loyaltyPoints.find(p => p.customerId === customerId);
      if (!customerLoyalty) {
        throw new Error('Customer loyalty not found');
      }

      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) {
        throw new Error('Reward not found');
      }

      if (!reward.isActive) {
        throw new Error('Reward is not active');
      }

      if (customerLoyalty.points < reward.pointsCost) {
        throw new Error('Insufficient points');
      }

      customerLoyalty.points -= reward.pointsCost;
      customerLoyalty.totalRedeemed += reward.pointsCost;
      customerLoyalty.tier = getTier(customerLoyalty.points);
      customerLoyalty.updatedAt = new Date().toISOString();

      const updatedPoints = loyaltyPoints.map(p => 
        p.customerId === customerId ? customerLoyalty : p
      );
      await savePoints(updatedPoints);

      const transaction: LoyaltyTransaction = {
        id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        customerName: customerLoyalty.customerName,
        type: 'redeem',
        points: reward.pointsCost,
        reason: `Redeemed: ${reward.nameKurdish}`,
        relatedId: rewardId,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'system',
        createdByName: user?.name || 'سیستەم',
      };

      await saveTransactions([...transactions, transaction]);

      const redemption: LoyaltyRedemption = {
        id: `redemption-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        customerName: customerLoyalty.customerName,
        rewardId,
        rewardName: reward.nameKurdish,
        pointsUsed: reward.pointsCost,
        status: 'pending',
        redeemedAt: new Date().toISOString(),
      };

      await saveRedemptions([...redemptions, redemption]);

      return redemption;
    } catch (error) {
      throw error;
    }
  }, [loyaltyPoints, rewards, redemptions, transactions, user, getTier, savePoints, saveTransactions, saveRedemptions]);

  const getCustomerTransactions = useCallback((customerId: string) => {
    return transactions
      .filter(t => t.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const getCustomerRedemptions = useCallback((customerId: string) => {
    return redemptions
      .filter(r => r.customerId === customerId)
      .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());
  }, [redemptions]);

  const getActiveRewards = useCallback(() => {
    return rewards.filter(r => r.isActive);
  }, [rewards]);

  const addReward = useCallback(async (reward: Omit<LoyaltyReward, 'id'>) => {
    const newReward: LoyaltyReward = {
      ...reward,
      id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    await saveRewards([...rewards, newReward]);
    return newReward;
  }, [rewards, saveRewards]);

  const updateReward = useCallback(async (rewardId: string, updates: Partial<LoyaltyReward>) => {
    const updatedRewards = rewards.map(r => 
      r.id === rewardId ? { ...r, ...updates } : r
    );
    await saveRewards(updatedRewards);
  }, [rewards, saveRewards]);

  const deleteReward = useCallback(async (rewardId: string) => {
    const updatedRewards = rewards.filter(r => r.id !== rewardId);
    await saveRewards(updatedRewards);
  }, [rewards, saveRewards]);

  const updateSettings = useCallback(async (updates: Partial<LoyaltySettings>) => {
    const updatedSettings = { ...settings, ...updates };
    await saveSettings(updatedSettings);
  }, [settings, saveSettings]);

  return useMemo(() => ({
    loyaltyPoints,
    transactions,
    rewards,
    redemptions,
    settings,
    isLoading,
    getCustomerPoints,
    addPoints,
    redeemPoints,
    getCustomerTransactions,
    getCustomerRedemptions,
    getActiveRewards,
    addReward,
    updateReward,
    deleteReward,
    updateSettings,
    getTier,
  }), [
    loyaltyPoints,
    transactions,
    rewards,
    redemptions,
    settings,
    isLoading,
    getCustomerPoints,
    addPoints,
    redeemPoints,
    getCustomerTransactions,
    getCustomerRedemptions,
    getActiveRewards,
    addReward,
    updateReward,
    deleteReward,
    updateSettings,
    getTier,
  ]);
});
