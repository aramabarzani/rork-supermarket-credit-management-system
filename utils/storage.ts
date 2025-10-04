import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

let currentTenantId: string | null = null;

export const setCurrentTenantId = (tenantId: string | null) => {
  currentTenantId = tenantId;
  console.log('[Storage] Current tenant set to:', tenantId);
};

export const getCurrentTenantId = (): string | null => {
  return currentTenantId;
};

const getTenantKey = (key: string): string => {
  if (!currentTenantId) {
    return key;
  }
  return `tenant_${currentTenantId}_${key}`;
};

export const safeStorage = {
  getItem: async <T>(key: string, defaultValue: T | null = null): Promise<T | null> => {
    try {
      const tenantKey = getTenantKey(key);
      let item: string | null = null;
      
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return defaultValue;
        }
        try {
          item = localStorage.getItem(tenantKey);
        } catch {
          return defaultValue;
        }
      } else {
        item = await AsyncStorage.getItem(tenantKey);
      }
      
      if (!item || !item.trim()) {
        return defaultValue;
      }
      
      const trimmedItem = item.trim();
      
      if (!trimmedItem.startsWith('[') && !trimmedItem.startsWith('{') && !trimmedItem.startsWith('"')) {
        console.warn('[Storage] Invalid JSON format for tenant key:', key, 'Value starts with:', trimmedItem.substring(0, 10));
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const tenantKey = getTenantKey(key);
            localStorage.removeItem(tenantKey);
          }
        } else {
          const tenantKey = getTenantKey(key);
          await AsyncStorage.removeItem(tenantKey);
        }
        return defaultValue;
      }
      
      try {
        return JSON.parse(trimmedItem) as T;
      } catch (parseError) {
        console.error('[Storage] JSON parse error for tenant key:', key, 'Error:', parseError);
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const tenantKey = getTenantKey(key);
            localStorage.removeItem(tenantKey);
          }
        } else {
          const tenantKey = getTenantKey(key);
          await AsyncStorage.removeItem(tenantKey);
        }
        return defaultValue;
      }
    } catch {
      await safeStorage.removeItem(key);
      return defaultValue;
    }
  },
  
  getGlobalItem: async <T>(key: string, defaultValue: T | null = null): Promise<T | null> => {
    try {
      let item: string | null = null;
      
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return defaultValue;
        }
        try {
          item = localStorage.getItem(key);
        } catch {
          return defaultValue;
        }
      } else {
        item = await AsyncStorage.getItem(key);
      }
      
      if (!item || !item.trim()) {
        return defaultValue;
      }
      
      const trimmedItem = item.trim();
      
      if (!trimmedItem.startsWith('[') && !trimmedItem.startsWith('{') && !trimmedItem.startsWith('"')) {
        console.warn('[Storage] Invalid JSON format for key:', key, 'Value starts with:', trimmedItem.substring(0, 10));
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
          }
        } else {
          await AsyncStorage.removeItem(key);
        }
        return defaultValue;
      }
      
      try {
        return JSON.parse(trimmedItem) as T;
      } catch (parseError) {
        console.error('[Storage] JSON parse error for key:', key, 'Error:', parseError);
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
          }
        } else {
          await AsyncStorage.removeItem(key);
        }
        return defaultValue;
      }
    } catch {
      return defaultValue;
    }
  },
  
  setItem: async <T>(key: string, value: T): Promise<boolean> => {
    try {
      if (value === null || value === undefined) {
        return false;
      }
      
      const tenantKey = getTenantKey(key);
      const jsonValue = JSON.stringify(value);
      
      if (!jsonValue || jsonValue === 'undefined' || jsonValue === 'null') {
        return false;
      }
      
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return false;
        }
        localStorage.setItem(tenantKey, jsonValue);
      } else {
        await AsyncStorage.setItem(tenantKey, jsonValue);
      }
      
      return true;
    } catch {
      return false;
    }
  },
  
  setGlobalItem: async <T>(key: string, value: T): Promise<boolean> => {
    try {
      if (value === null || value === undefined) {
        return false;
      }
      
      const jsonValue = JSON.stringify(value);
      
      if (!jsonValue || jsonValue === 'undefined' || jsonValue === 'null') {
        return false;
      }
      
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return false;
        }
        localStorage.setItem(key, jsonValue);
      } else {
        await AsyncStorage.setItem(key, jsonValue);
      }
      
      return true;
    } catch {
      return false;
    }
  },
  
  removeItem: async (key: string): Promise<boolean> => {
    try {
      const tenantKey = getTenantKey(key);
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return false;
        }
        localStorage.removeItem(tenantKey);
      } else {
        await AsyncStorage.removeItem(tenantKey);
      }
      
      return true;
    } catch {
      return false;
    }
  },
  
  clear: async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return false;
        }
        localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
      
      return true;
    } catch {
      return false;
    }
  },
  
  multiGet: async (keys: string[]): Promise<Record<string, any>> => {
    try {
      const result: Record<string, any> = {};
      
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return result;
        }
        
        for (const key of keys) {
          const tenantKey = getTenantKey(key);
          const item = localStorage.getItem(tenantKey);
          if (item) {
            try {
              result[key] = JSON.parse(item);
            } catch {
              result[key] = null;
            }
          }
        }
      } else {
        const tenantKeys = keys.map(k => getTenantKey(k));
        const items = await AsyncStorage.multiGet(tenantKeys);
        for (let i = 0; i < items.length; i++) {
          const [, value] = items[i];
          if (value) {
            try {
              result[keys[i]] = JSON.parse(value);
            } catch {
              result[keys[i]] = null;
            }
          }
        }
      }
      
      return result;
    } catch {
      return {};
    }
  }
};
