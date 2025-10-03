import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  LoyaltyProgram,
  LoyaltyReward,
  CustomerLoyaltyPoints,
  LoyaltyTransaction,
  LOYALTY_TIERS
} from '@/types/loyalty';
import { safeStorage } from '@/utils/storage';
import { useAuth } from '@/hooks/auth-context';

const LOYALTY_PROGRAMS_KEY = 'loyalty_programs';
const LOYALTY_POINTS_KEY = 'loyalty_customer_points';
const LOYALTY_TRANSACTIONS_KEY = 'loyalty_transactions';
const LOYALTY_REWARDS_KEY = 'loyalty_rewards';

const defaultProgram: LoyaltyProgram = {
  id: 'default',
  name: 'Default Loyalty Program',
  nameKurdish: 'پرۆگرامی دڵسۆزی بنەڕەتی',
  description: 'Earn points on every purchase',
  descriptionKurdish: 'خاڵ بەدەست بهێنە لەسەر هەر کڕینێک',
  pointsPerDinar: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const [LoyaltyProvider, useLoyalty] = createContextHook(() => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([defaultProgram]);
  const [customerPoints, setCustomerPoints] = useState<CustomerLoyaltyPoints[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [progs, points, trans, rew] = await Promise.all([
        safeStorage.getItem<LoyaltyProgram[]>(LOYALTY_PROGRAMS_KEY, [defaultProgram]),
        safeStorage.getItem<CustomerLoyaltyPoints[]>(LOYALTY_POINTS_KEY, []),
        safeStorage.getItem<LoyaltyTransaction[]>(LOYALTY_TRANSACTIONS_KEY, []),
        safeStorage.getItem<LoyaltyReward[]>(LOYALTY_REWARDS_KEY, []),
      ]);

      if (progs && progs.length > 0) setPrograms(progs);
      if (points) setCustomerPoints(points);
      if (trans) setTransactions(trans);
      if (rew) setRewards(rew);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePrograms = useCallback(async (progs: LoyaltyProgram[]) => {
    setPrograms(progs);
    await safeStorage.setItem(LOYALTY_PROGRAMS_KEY, progs);
  }, []);

  const saveCustomerPoints = useCallback(async (points: CustomerLoyaltyPoints[]) => {
    setCustomerPoints(points);
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

  const getTier = useCallback((points: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
    const sortedTiers = [...LOYALTY_TIERS].sort((a, b) => b.minPoints - a.minPoints);
    for (const tier of sortedTiers) {
      if (points >= tier.minPoints) {
        return tier.name;
      }
    }
    return 'bronze';
  }, []);

  const getCustomerPoints = useCallback((customerId: string): CustomerLoyaltyPoints | null => {
    return customerPoints.find(p => p.customerId === customerId) || null;
  }, [customerPoints]);

  const addPoints = useCallback(async (
    customerId: string,
    customerName: string,
    points: number,
    reason: string,
    reasonKurdish: string,
    relatedDebtId?: string,
    relatedPaymentId?: string
  ) => {
    try {
      const activeProgram = programs.find(p => p.isActive) || programs[0];
      if (!activeProgram) {
        throw new Error('No active loyalty program found');
      }

      let customerLoyalty = customerPoints.find(p => p.customerId === customerId);
      const balanceBefore = customerLoyalty?.availablePoints || 0;

      if (!customerLoyalty) {
        customerLoyalty = {
          id: `loyalty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          customerId,
          customerName,
          programId: activeProgram.id,
          totalPoints: 0,
          availablePoints: 0,
          usedPoints: 0,
          lifetimePoints: 0,
          tier: 'bronze',
          joinedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        };
      }

      const earnedPoints = Math.floor(points);

      customerLoyalty.totalPoints += earnedPoints;
      customerLoyalty.availablePoints += earnedPoints;
      customerLoyalty.lifetimePoints += earnedPoints;
      customerLoyalty.tier = getTier(customerLoyalty.lifetimePoints);
      customerLoyalty.lastActivityAt = new Date().toISOString();

      const updatedPoints = customerPoints.some(p => p.customerId === customerId)
        ? customerPoints.map(p => p.customerId === customerId ? customerLoyalty! : p)
        : [...customerPoints, customerLoyalty];

      await saveCustomerPoints(updatedPoints);

      const transaction: LoyaltyTransaction = {
        id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        customerName,
        programId: activeProgram.id,
        type: 'earn',
        points: earnedPoints,
        balanceBefore,
        balanceAfter: customerLoyalty.availablePoints,
        reason,
        reasonKurdish,
        relatedDebtId,
        relatedPaymentId,
        createdBy: user?.id || 'system',
        createdAt: new Date().toISOString(),
      };

      await saveTransactions([...transactions, transaction]);

      console.log(`[Loyalty] Added ${earnedPoints} points to ${customerName}`);
      return customerLoyalty;
    } catch (error) {
      console.error('[Loyalty] Error adding points:', error);
      throw error;
    }
  }, [customerPoints, transactions, programs, user, getTier, saveCustomerPoints, saveTransactions]);

  const redeemPoints = useCallback(async (
    customerId: string,
    rewardId: string
  ) => {
    try {
      const customerLoyalty = customerPoints.find(p => p.customerId === customerId);
      if (!customerLoyalty) {
        throw new Error('خاڵی دڵسۆزی کڕیار نەدۆزرایەوە');
      }

      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) {
        throw new Error('خەڵات نەدۆزرایەوە');
      }

      if (!reward.isActive) {
        throw new Error('خەڵاتەکە چالاک نییە');
      }

      if (customerLoyalty.availablePoints < reward.pointsRequired) {
        throw new Error('خاڵی پێویست بەسنییە');
      }

      const balanceBefore = customerLoyalty.availablePoints;

      customerLoyalty.availablePoints -= reward.pointsRequired;
      customerLoyalty.usedPoints += reward.pointsRequired;
      customerLoyalty.lastActivityAt = new Date().toISOString();

      const updatedPoints = customerPoints.map(p => 
        p.customerId === customerId ? customerLoyalty : p
      );
      await saveCustomerPoints(updatedPoints);

      const transaction: LoyaltyTransaction = {
        id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        customerName: customerLoyalty.customerName,
        programId: customerLoyalty.programId,
        type: 'redeem',
        points: reward.pointsRequired,
        balanceBefore,
        balanceAfter: customerLoyalty.availablePoints,
        reason: `Redeemed: ${reward.name}`,
        reasonKurdish: `بەکارهێنرا: ${reward.nameKurdish}`,
        relatedRewardId: rewardId,
        createdBy: user?.id || 'system',
        createdAt: new Date().toISOString(),
      };

      await saveTransactions([...transactions, transaction]);

      reward.usedCount += 1;
      const updatedRewards = rewards.map(r => r.id === rewardId ? reward : r);
      await saveRewards(updatedRewards);

      console.log(`[Loyalty] ${customerLoyalty.customerName} redeemed ${reward.nameKurdish}`);
      return transaction;
    } catch (error) {
      console.error('[Loyalty] Error redeeming points:', error);
      throw error;
    }
  }, [customerPoints, rewards, transactions, user, saveCustomerPoints, saveTransactions, saveRewards]);

  const getCustomerTransactions = useCallback((customerId: string) => {
    return transactions
      .filter(t => t.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const getCustomerRedemptions = useCallback((customerId: string) => {
    return transactions
      .filter(t => t.customerId === customerId && t.type === 'redeem')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const getActiveRewards = useCallback(() => {
    return rewards.filter(r => r.isActive);
  }, [rewards]);

  const addReward = useCallback(async (reward: Omit<LoyaltyReward, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>) => {
    const newReward: LoyaltyReward = {
      ...reward,
      id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveRewards([...rewards, newReward]);
    console.log(`[Loyalty] Created reward: ${newReward.nameKurdish}`);
    return newReward;
  }, [rewards, saveRewards]);

  const updateReward = useCallback(async (rewardId: string, updates: Partial<LoyaltyReward>) => {
    const updatedRewards = rewards.map(r => 
      r.id === rewardId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    await saveRewards(updatedRewards);
    console.log(`[Loyalty] Updated reward: ${rewardId}`);
  }, [rewards, saveRewards]);

  const deleteReward = useCallback(async (rewardId: string) => {
    const updatedRewards = rewards.filter(r => r.id !== rewardId);
    await saveRewards(updatedRewards);
  }, [rewards, saveRewards]);

  const addProgram = useCallback(async (program: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProgram: LoyaltyProgram = {
      ...program,
      id: `program-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await savePrograms([...programs, newProgram]);
    console.log(`[Loyalty] Created program: ${newProgram.nameKurdish}`);
    return newProgram;
  }, [programs, savePrograms]);

  const updateProgram = useCallback(async (programId: string, updates: Partial<LoyaltyProgram>) => {
    const updatedPrograms = programs.map(p => 
      p.id === programId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    await savePrograms(updatedPrograms);
    console.log(`[Loyalty] Updated program: ${programId}`);
  }, [programs, savePrograms]);

  return useMemo(() => ({
    programs,
    customerPoints,
    transactions,
    rewards,
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
    addProgram,
    updateProgram,
    getTier,
  }), [
    programs,
    customerPoints,
    transactions,
    rewards,
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
    addProgram,
    updateProgram,
    getTier,
  ]);
});
