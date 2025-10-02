import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlacklistEntry, BlacklistAlert, BlacklistStats, BlacklistReason, BlacklistStatus } from '@/types/blacklist';
import { useDebts } from './debt-context';

const BLACKLIST_KEY = 'blacklist_entries';
const BLACKLIST_ALERTS_KEY = 'blacklist_alerts';

export const [BlacklistProvider, useBlacklist] = createContextHook(() => {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [alerts, setAlerts] = useState<BlacklistAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { debts } = useDebts();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entriesData, alertsData] = await Promise.all([
        AsyncStorage.getItem(BLACKLIST_KEY),
        AsyncStorage.getItem(BLACKLIST_ALERTS_KEY),
      ]);

      if (entriesData) setEntries(JSON.parse(entriesData));
      if (alertsData) setAlerts(JSON.parse(alertsData));
    } catch (error) {
      console.error('Error loading blacklist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntries = async (newEntries: BlacklistEntry[]) => {
    try {
      await AsyncStorage.setItem(BLACKLIST_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Error saving blacklist entries:', error);
    }
  };

  const saveAlerts = async (newAlerts: BlacklistAlert[]) => {
    try {
      await AsyncStorage.setItem(BLACKLIST_ALERTS_KEY, JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error saving blacklist alerts:', error);
    }
  };

  const addToBlacklist = async (entry: Omit<BlacklistEntry, 'id' | 'addedAt' | 'status'>) => {
    const newEntry: BlacklistEntry = {
      ...entry,
      id: Date.now().toString(),
      addedAt: new Date().toISOString(),
      status: 'active',
    };

    await saveEntries([...entries, newEntry]);

    const alert: BlacklistAlert = {
      id: Date.now().toString(),
      customerId: entry.customerId,
      customerName: entry.customerName,
      alertType: 'critical',
      message: `کڕیار ${entry.customerName} زیادکرا بۆ لیستی ڕەوش`,
      createdAt: new Date().toISOString(),
    };

    await saveAlerts([...alerts, alert]);
  };

  const removeFromBlacklist = async (id: string, removedBy: string, removalReason: string) => {
    const updated = entries.map(entry =>
      entry.id === id
        ? {
            ...entry,
            status: 'removed' as BlacklistStatus,
            removedBy,
            removedAt: new Date().toISOString(),
            removalReason,
          }
        : entry
    );

    await saveEntries(updated);
  };

  const updateBlacklistEntry = async (id: string, updates: Partial<BlacklistEntry>) => {
    const updated = entries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    );

    await saveEntries(updated);
  };

  const checkCustomerBlacklist = (customerId: string): BlacklistEntry | undefined => {
    return entries.find(
      entry => entry.customerId === customerId && entry.status === 'active'
    );
  };

  const getStats = (): BlacklistStats => {
    const active = entries.filter(e => e.status === 'active');
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const removedThisMonth = entries.filter(
      e => e.status === 'removed' && e.removedAt && new Date(e.removedAt) >= thisMonth
    ).length;

    const reasonBreakdown: Record<BlacklistReason, number> = {
      repeated_late_payment: 0,
      fraud: 0,
      excessive_debt: 0,
      bounced_check: 0,
      legal_issue: 0,
      other: 0,
    };

    active.forEach(entry => {
      reasonBreakdown[entry.reason]++;
    });

    return {
      totalBlacklisted: entries.length,
      activeBlacklisted: active.length,
      removedThisMonth,
      underReview: entries.filter(e => e.status === 'under_review').length,
      totalDebtFromBlacklisted: active.reduce((sum, e) => sum + e.totalDebt, 0),
      reasonBreakdown,
    };
  };

  const dismissAlert = async (alertId: string) => {
    const updated = alerts.filter(a => a.id !== alertId);
    await saveAlerts(updated);
  };

  return {
    entries,
    alerts,
    loading,
    addToBlacklist,
    removeFromBlacklist,
    updateBlacklistEntry,
    checkCustomerBlacklist,
    getStats,
    dismissAlert,
  };
});
