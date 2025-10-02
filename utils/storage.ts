import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Cross-platform storage utilities with error handling
 * Works with AsyncStorage on mobile and localStorage on web
 */

export const safeStorage = {
  /**
   * Safely get and parse JSON from storage with optional decryption
   */
  getItem: async <T>(key: string, defaultValue: T | null = null): Promise<T | null> => {
    try {
      let item: string | null = null;
      
      if (Platform.OS === 'web') {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return defaultValue;
        }
        try {
          item = localStorage.getItem(key);
        } catch (storageError) {
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
        await safeStorage.removeItem(key);
        return defaultValue;
      }
      
      try {
        return JSON.parse(trimmedItem) as T;
      } catch (parseError) {
        await safeStorage.removeItem(key);
        return defaultValue;
      }
    } catch (error) {
      await safeStorage.removeItem(key);
      return defaultValue;
    }
  },
  
  /**
   * Safely set JSON to storage with optional encryption
   */
  setItem: async <T>(key: string, value: T): Promise<boolean> => {
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
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Safely remove item from storage
   */
  removeItem: async (key: string): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return false;
        }
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Clear all storage data
   */
  clear: async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return false;
        }
        localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
      
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Get multiple items at once
   */
  multiGet: async (keys: string[]): Promise<Record<string, any>> => {
    try {
      const result: Record<string, any> = {};
      
      if (Platform.OS === 'web') {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return result;
        }
        
        for (const key of keys) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              result[key] = JSON.parse(item);
            } catch {
              result[key] = null;
            }
          }
        }
      } else {
        const items = await AsyncStorage.multiGet(keys);
        for (const [key, value] of items) {
          if (value) {
            try {
              result[key] = JSON.parse(value);
            } catch {
              result[key] = null;
            }
          }
        }
      }
      
      return result;
    } catch (error) {
      return {};
    }
  }
};