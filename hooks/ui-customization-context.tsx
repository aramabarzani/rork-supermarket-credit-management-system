import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { safeStorage } from '@/utils/storage';
import {
  UICustomization,
  RoleUICustomization,
  UserUIPreferences,
  DEFAULT_UI_CUSTOMIZATION,
  DashboardLayout,
  DashboardWidget,
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

  const addDashboardLayout = useCallback(async (layout: Omit<DashboardLayout, 'id'>) => {
    try {
      const newLayout: DashboardLayout = {
        ...layout,
        id: `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const layouts = currentCustomization.dashboardLayouts || [];
      const updated = { ...currentCustomization, dashboardLayouts: [...layouts, newLayout] };
      setCurrentCustomization(updated);
      safeStorage.setItem(UI_CUSTOMIZATION_KEY, updated);
      return newLayout;
    } catch (error) {
      console.error('Error adding dashboard layout:', error);
      throw error;
    }
  }, [currentCustomization]);

  const updateDashboardLayout = useCallback(async (layoutId: string, updates: Partial<DashboardLayout>) => {
    try {
      const layouts = currentCustomization.dashboardLayouts || [];
      const updatedLayouts = layouts.map(l => l.id === layoutId ? { ...l, ...updates } : l);
      const updated = { ...currentCustomization, dashboardLayouts: updatedLayouts };
      setCurrentCustomization(updated);
      safeStorage.setItem(UI_CUSTOMIZATION_KEY, updated);
    } catch (error) {
      console.error('Error updating dashboard layout:', error);
    }
  }, [currentCustomization]);

  const deleteDashboardLayout = useCallback(async (layoutId: string) => {
    try {
      const layouts = currentCustomization.dashboardLayouts || [];
      const filtered = layouts.filter(l => l.id !== layoutId);
      const updated = { ...currentCustomization, dashboardLayouts: filtered };
      setCurrentCustomization(updated);
      safeStorage.setItem(UI_CUSTOMIZATION_KEY, updated);
    } catch (error) {
      console.error('Error deleting dashboard layout:', error);
    }
  }, [currentCustomization]);

  const setActiveDashboard = useCallback(async (layoutId: string) => {
    try {
      const updated = { ...currentCustomization, activeDashboardId: layoutId };
      setCurrentCustomization(updated);
      safeStorage.setItem(UI_CUSTOMIZATION_KEY, updated);
    } catch (error) {
      console.error('Error setting active dashboard:', error);
    }
  }, [currentCustomization]);

  const addWidgetToLayout = useCallback(async (layoutId: string, widget: Omit<DashboardWidget, 'id'>) => {
    try {
      const layouts = currentCustomization.dashboardLayouts || [];
      const layout = layouts.find(l => l.id === layoutId);
      if (!layout) throw new Error('Layout not found');

      const newWidget: DashboardWidget = {
        ...widget,
        id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const updatedLayout = {
        ...layout,
        widgets: [...layout.widgets, newWidget],
      };

      await updateDashboardLayout(layoutId, updatedLayout);
      return newWidget;
    } catch (error) {
      console.error('Error adding widget:', error);
      throw error;
    }
  }, [currentCustomization, updateDashboardLayout]);

  const updateWidget = useCallback(async (layoutId: string, widgetId: string, updates: Partial<DashboardWidget>) => {
    try {
      const layouts = currentCustomization.dashboardLayouts || [];
      const layout = layouts.find(l => l.id === layoutId);
      if (!layout) throw new Error('Layout not found');

      const updatedWidgets = layout.widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w);
      await updateDashboardLayout(layoutId, { widgets: updatedWidgets });
    } catch (error) {
      console.error('Error updating widget:', error);
    }
  }, [currentCustomization, updateDashboardLayout]);

  const deleteWidget = useCallback(async (layoutId: string, widgetId: string) => {
    try {
      const layouts = currentCustomization.dashboardLayouts || [];
      const layout = layouts.find(l => l.id === layoutId);
      if (!layout) throw new Error('Layout not found');

      const filteredWidgets = layout.widgets.filter(w => w.id !== widgetId);
      await updateDashboardLayout(layoutId, { widgets: filteredWidgets });
    } catch (error) {
      console.error('Error deleting widget:', error);
    }
  }, [currentCustomization, updateDashboardLayout]);

  const getActiveDashboard = useCallback((): DashboardLayout | null => {
    const layouts = currentCustomization.dashboardLayouts || [];
    if (currentCustomization.activeDashboardId) {
      return layouts.find(l => l.id === currentCustomization.activeDashboardId) || null;
    }
    return layouts.find(l => l.isDefault) || layouts[0] || null;
  }, [currentCustomization]);

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
    addDashboardLayout,
    updateDashboardLayout,
    deleteDashboardLayout,
    setActiveDashboard,
    addWidgetToLayout,
    updateWidget,
    deleteWidget,
    getActiveDashboard,
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
    addDashboardLayout,
    updateDashboardLayout,
    deleteDashboardLayout,
    setActiveDashboard,
    addWidgetToLayout,
    updateWidget,
    deleteWidget,
    getActiveDashboard,
  ]);
});

export { UICustomizationProvider, useUICustomization };
