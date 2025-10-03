import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

const CACHE_PREFIX = '@cache_';

export class CacheManager {
  static async set<T>(
    key: string,
    data: T,
    expiresInMinutes: number = 60
  ): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: expiresInMinutes * 60 * 1000,
      };
      
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      
      if (!cached) {
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();
      const age = now - cacheItem.timestamp;

      if (age > cacheItem.expiresIn) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  static async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  static async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    expiresInMinutes: number = 60
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    await this.set(key, data, expiresInMinutes);
    return data;
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const matchingKeys = keys.filter(key => 
        key.startsWith(CACHE_PREFIX) && key.includes(pattern)
      );
      await AsyncStorage.multiRemove(matchingKeys);
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  static async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Cache size error:', error);
      return 0;
    }
  }

  static async getCacheInfo(): Promise<{
    count: number;
    size: number;
    keys: string[];
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      const size = await this.getCacheSize();
      
      return {
        count: cacheKeys.length,
        size,
        keys: cacheKeys.map(key => key.replace(CACHE_PREFIX, '')),
      };
    } catch (error) {
      console.error('Cache info error:', error);
      return { count: 0, size: 0, keys: [] };
    }
  }
}

export const cache = CacheManager;
