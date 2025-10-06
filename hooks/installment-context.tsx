import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Installment, InstallmentPlan, InstallmentReminder, InstallmentReport } from '@/types/installment';
import { safeStorage } from '@/utils/storage';
import { useAuth } from '@/hooks/auth-context';

const INSTALLMENTS_STORAGE_KEY = 'installments';
const INSTALLMENT_PLANS_STORAGE_KEY = 'installment_plans';
const INSTALLMENT_REMINDERS_STORAGE_KEY = 'installment_reminders';

export const [InstallmentProvider, useInstallments] = createContextHook(() => {
  const { user } = useAuth();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);
  const [installmentReminders, setInstallmentReminders] = useState<InstallmentReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.tenantId) {
        console.log('[Installment] No tenantId, loading empty data');
        setInstallments([]);
        setInstallmentPlans([]);
        setInstallmentReminders([]);
        setIsLoading(false);
        return;
      }
      
      console.log('[Installment] Loading data for tenant:', user.tenantId);
      const storedInstallments = await safeStorage.getItem<Installment[]>(INSTALLMENTS_STORAGE_KEY, []);
      const storedPlans = await safeStorage.getItem<InstallmentPlan[]>(INSTALLMENT_PLANS_STORAGE_KEY, []);
      const storedReminders = await safeStorage.getItem<InstallmentReminder[]>(INSTALLMENT_REMINDERS_STORAGE_KEY, []);
      
      setInstallments(storedInstallments || []);
      setInstallmentPlans(storedPlans || []);
      setInstallmentReminders(storedReminders || []);
      
      console.log('[Installment] Loaded:', {
        installments: storedInstallments?.length || 0,
        plans: storedPlans?.length || 0,
        reminders: storedReminders?.length || 0,
        tenantId: user.tenantId
      });
    } catch (error) {
      console.error('[Installment] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveInstallments = useCallback(async (newInstallments: Installment[]) => {
    setInstallments(newInstallments);
    await safeStorage.setItem(INSTALLMENTS_STORAGE_KEY, newInstallments);
  }, []);

  const savePlans = useCallback(async (newPlans: InstallmentPlan[]) => {
    setInstallmentPlans(newPlans);
    await safeStorage.setItem(INSTALLMENT_PLANS_STORAGE_KEY, newPlans);
  }, []);

  const saveReminders = useCallback(async (newReminders: InstallmentReminder[]) => {
    setInstallmentReminders(newReminders);
    await safeStorage.setItem(INSTALLMENT_REMINDERS_STORAGE_KEY, newReminders);
  }, []);

  const createInstallmentPlan = useCallback(async (planData: {
    debtId: string;
    customerId: string;
    customerName: string;
    totalAmount: number;
    numberOfInstallments: number;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    startDate: string;
    notes?: string;
  }) => {
    try {
      const installmentAmount = planData.totalAmount / planData.numberOfInstallments;
      
      const installments: Installment[] = [];
      let currentDate = new Date(planData.startDate);
      
      for (let i = 0; i < planData.numberOfInstallments; i++) {
        const installment: Installment = {
          id: `installment-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          debtId: planData.debtId,
          customerId: planData.customerId,
          customerName: planData.customerName,
          amount: installmentAmount,
          dueDate: currentDate.toISOString(),
          status: 'pending',
          installmentNumber: i + 1,
          totalInstallments: planData.numberOfInstallments,
          createdAt: new Date().toISOString(),
          createdBy: user?.id || 'unknown',
          createdByName: user?.name || 'نەناسراو',
        };
        
        installments.push(installment);
        
        switch (planData.frequency) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'biweekly':
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
      }
      
      const endDate = new Date(installments[installments.length - 1].dueDate);
      
      const newPlan: InstallmentPlan = {
        id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        debtId: planData.debtId,
        customerId: planData.customerId,
        customerName: planData.customerName,
        totalAmount: planData.totalAmount,
        numberOfInstallments: planData.numberOfInstallments,
        installmentAmount,
        frequency: planData.frequency,
        startDate: planData.startDate,
        endDate: endDate.toISOString(),
        status: 'active',
        installments,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'unknown',
        createdByName: user?.name || 'نەناسراو',
        notes: planData.notes,
      };
      
      const updatedPlans = [...installmentPlans, newPlan];
      await savePlans(updatedPlans);
      
      const updatedInstallments = [...installments, ...installments];
      await saveInstallments(updatedInstallments);
      
      return newPlan;
    } catch (error) {
      throw error;
    }
  }, [installmentPlans, user, savePlans, saveInstallments]);

  const payInstallment = useCallback(async (installmentId: string) => {
    try {
      const installment = installments.find(i => i.id === installmentId);
      if (!installment) {
        throw new Error('Installment not found');
      }
      
      if (installment.status === 'paid') {
        throw new Error('ئەم بەشە پێشتر پارەدراوە');
      }
      
      const updatedInstallment: Installment = {
        ...installment,
        status: 'paid',
        paidAt: new Date().toISOString(),
        paidBy: user?.id || 'unknown',
        paidByName: user?.name || 'نەناسراو',
      };
      
      const updatedInstallments = installments.map(i => 
        i.id === installmentId ? updatedInstallment : i
      );
      await saveInstallments(updatedInstallments);
      
      const plan = installmentPlans.find(p => p.debtId === installment.debtId);
      if (plan) {
        const paidCount = updatedInstallments.filter(i => 
          i.debtId === plan.debtId && i.status === 'paid'
        ).length;
        
        const updatedPlan: InstallmentPlan = {
          ...plan,
          status: paidCount === plan.numberOfInstallments ? 'completed' : 'active',
        };
        
        const updatedPlans = installmentPlans.map(p => 
          p.id === plan.id ? updatedPlan : p
        );
        await savePlans(updatedPlans);
      }
      
      return updatedInstallment;
    } catch (error) {
      throw error;
    }
  }, [installments, installmentPlans, user, saveInstallments, savePlans]);

  const getInstallmentReport = useCallback((): InstallmentReport => {
    const totalInstallments = installments.length;
    const paidInstallments = installments.filter(i => i.status === 'paid').length;
    const pendingInstallments = installments.filter(i => i.status === 'pending').length;
    const overdueInstallments = installments.filter(i => {
      if (i.status !== 'pending') return false;
      return new Date(i.dueDate) < new Date();
    }).length;
    
    const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);
    const paidAmount = installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const pendingAmount = installments.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
    const overdueAmount = installments.filter(i => {
      if (i.status !== 'pending') return false;
      return new Date(i.dueDate) < new Date();
    }).reduce((sum, i) => sum + i.amount, 0);
    
    const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
    const onTimePaymentRate = paidInstallments > 0 ? 
      (installments.filter(i => i.status === 'paid' && i.paidAt && new Date(i.paidAt) <= new Date(i.dueDate)).length / paidInstallments) * 100 : 0;
    
    return {
      totalInstallments,
      paidInstallments,
      pendingInstallments,
      overdueInstallments,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      collectionRate,
      onTimePaymentRate,
    };
  }, [installments]);

  const getCustomerInstallments = useCallback((customerId: string) => {
    return installments.filter(i => i.customerId === customerId);
  }, [installments]);

  const getDebtInstallments = useCallback((debtId: string) => {
    return installments.filter(i => i.debtId === debtId);
  }, [installments]);

  const getOverdueInstallments = useCallback(() => {
    const now = new Date();
    return installments.filter(i => {
      if (i.status !== 'pending') return false;
      return new Date(i.dueDate) < now;
    });
  }, [installments]);

  return useMemo(() => ({
    installments,
    installmentPlans,
    installmentReminders,
    isLoading,
    createInstallmentPlan,
    payInstallment,
    getInstallmentReport,
    getCustomerInstallments,
    getDebtInstallments,
    getOverdueInstallments,
  }), [installments, installmentPlans, installmentReminders, isLoading, createInstallmentPlan, payInstallment, getInstallmentReport, getCustomerInstallments, getDebtInstallments, getOverdueInstallments]);
});
