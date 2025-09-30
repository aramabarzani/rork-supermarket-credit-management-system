import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { safeStorage } from '@/utils/storage';
import {
  UICustomization,
  RoleUICustomization,
  UserUIPreferences,
  DEFAULT_UI_CUSTOMIZATION,
} from '@/types/ui-customization';

const UI_CUSTOMIZATION_KEY = 'ui_customization';
const ROLE_CUSTOMIZATIONS_KEY = 'role_customizations';
const USER_PREFERENCES_KEY = 'user_preferences';

const [UICustomizationProvider, useUICustomization] = createContextHook(() => {
  const [currentCustomization, setCurrentCustomization] = useState<UICustomization>(DEFAULT_UI_CUSTOMIZATION);
  const [roleCustomizations, setRoleCustomizations] = useState<RoleUICustomization[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserUIPreferences[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        setIsHydrated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const loadCustomizations = async () => {
      try {
        const [stored, roleStored, userStored] = await Promise.all([
          safeStorage.getItem<UICustomization>(UI_CUSTOMIZATION_KEY),
          safeStorage.getItem<RoleUICustomization[]>(ROLE_CUSTOMIZATIONS_KEY),
          safeStorage.getItem<UserUIPreferences[]>(USER_PREFERENCES_KEY),
        ]);

        if (stored) {
          setCurrentCustomization({ ...DEFAULT_UI_CUSTOMIZATION, ...stored });
        }
        if (roleStored) {
          setRoleCustomizations(roleStored);
        }
        if (userStored) {
          setUserPreferences(userStored);
        }
      } catch (error) {
        console.error('Error loading UI customizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadCustomizations, Platform.OS === 'web' ? 10 : 0);
    return () => clearTimeout(timer);
  }, [isHydrated]);

  const updateCustomization = useCallback(async (updates: Partial<UICustomization>) => {
    try {
      const updated = { ...currentCustomization, ...updates };
      setCurrentCustomization(updated);
      safeStorage.setItem(UI_CUSTOMIZATION_KEY, updated);
    } catch (error) {
      console.error('Error updating customization:', error);
    }
  }, [currentCustomization]);

  const updateRoleCustomization = useCallback(async (
    roleId: string,
    roleName: string,
    customization: Partial<UICustomization>
  ) => {
    try {
      const existing = roleCustomizations.find(r => r.roleId === roleId);
      const updated: RoleUICustomization = existing
        ? { ...existing, customization: { ...existing.customization, ...customization } }
        : { roleId, roleName, customization: { ...DEFAULT_UI_CUSTOMIZATION, ...customization } };

      const newRoleCustomizations = existing
        ? roleCustomizations.map(r => r.roleId === roleId ? updated : r)
        : [...roleCustomizations, updated];

      setRoleCustomizations(newRoleCustomizations);
      safeStorage.setItem(ROLE_CUSTOMIZATIONS_KEY, newRoleCustomizations);
    } catch (error) {
      console.error('Error updating role customization:', error);
    }
  }, [roleCustomizations]);

  const updateUserPreferences = useCallback(async (
    userId: string,
    preferences: Partial<UICustomization>,
    overrideRoleSettings: boolean = false
  ) => {
    try {
      const existing = userPreferences.find(u => u.userId === userId);
      const updated: UserUIPreferences = existing
        ? { ...existing, customization: { ...existing.customization, ...preferences }, overrideRoleSettings }
        : { userId, customization: preferences, overrideRoleSettings };

      const newUserPreferences = existing
        ? userPreferences.map(u => u.userId === userId ? updated : u)
        : [...userPreferences, updated];

      setUserPreferences(newUserPreferences);
      safeStorage.setItem(USER_PREFERENCES_KEY, newUserPreferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }, [userPreferences]);

  const getCustomizationForUser = useCallback((userId: string, roleId: string): UICustomization => {
    const userPref = userPreferences.find(u => u.userId === userId);
    const roleCust = roleCustomizations.find(r => r.roleId === roleId);

    if (userPref && userPref.overrideRoleSettings) {
      return { ...DEFAULT_UI_CUSTOMIZATION, ...roleCust?.customization, ...userPref.customization };
    }

    if (roleCust) {
      return { ...DEFAULT_UI_CUSTOMIZATION, ...roleCust.customization, ...userPref?.customization };
    }

    return { ...DEFAULT_UI_CUSTOMIZATION, ...userPref?.customization };
  }, [userPreferences, roleCustomizations]);

  const getRoleCustomization = useCallback((roleId: string): UICustomization | null => {
    const roleCust = roleCustomizations.find(r => r.roleId === roleId);
    return roleCust ? roleCust.customization : null;
  }, [roleCustomizations]);

  const getUserPreferences = useCallback((userId: string): UserUIPreferences | null => {
    return userPreferences.find(u => u.userId === userId) || null;
  }, [userPreferences]);

  const resetToDefault = useCallback(async () => {
    try {
      setCurrentCustomization(DEFAULT_UI_CUSTOMIZATION);
      safeStorage.setItem(UI_CUSTOMIZATION_KEY, DEFAULT_UI_CUSTOMIZATION);
    } catch (error) {
      console.error('Error resetting customization:', error);
    }
  }, []);

  const deleteRoleCustomization = useCallback(async (roleId: string) => {
    try {
      const filtered = roleCustomizations.filter(r => r.roleId !== roleId);
      setRoleCustomizations(filtered);
      safeStorage.setItem(ROLE_CUSTOMIZATIONS_KEY, filtered);
    } catch (error) {
      console.error('Error deleting role customization:', error);
    }
  }, [roleCustomizations]);

  const deleteUserPreferences = useCallback(async (userId: string) => {
    try {
      const filtered = userPreferences.filter(u => u.userId !== userId);
      setUserPreferences(filtered);
      safeStorage.setItem(USER_PREFERENCES_KEY, filtered);
    } catch (error) {
      console.error('Error deleting user preferences:', error);
    }
  }, [userPreferences]);

  return useMemo(() => ({
    currentCustomization,
    roleCustomizations,
    userPreferences,
    isLoading: isLoading || !isHydrated,
    updateCustomization,
    updateRoleCustomization,
    updateUserPreferences,
    getCustomizationForUser,
    getRoleCustomization,
    getUserPreferences,
    resetToDefault,
    deleteRoleCustomization,
    deleteUserPreferences,
  }), [
    currentCustomization,
    roleCustomizations,
    userPreferences,
    isLoading,
    isHydrated,
    updateCustomization,
    updateRoleCustomization,
    updateUserPreferences,
    getCustomizationForUser,
    getRoleCustomization,
    getUserPreferences,
    resetToDefault,
    deleteRoleCustomization,
    deleteUserPreferences,
  ]);
});

export { UICustomizationProvider, useUICustomization };
