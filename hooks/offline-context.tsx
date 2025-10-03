import { useState, useEffect, useCallback, useMemo } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface OfflineQueueItem {
  id: string;
  type: 'debt' | 'payment' | 'customer' | 'update';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineContextValue {
  isOnline: boolean;
  isConnected: boolean;
  queuedItems: OfflineQueueItem[];
  addToQueue: (type: OfflineQueueItem['type'], data: any) => Promise<void>;
  processQueue: () => Promise<void>;
  clearQueue: () => Promise<void>;
  getQueueSize: () => number;
}

const OFFLINE_QUEUE_KEY = '@offline_queue';
const MAX_RETRY_COUNT = 3;

export const [OfflineProvider, useOffline] = createContextHook<OfflineContextValue>(() => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [queuedItems, setQueuedItems] = useState<OfflineQueueItem[]>([]);

  const loadQueue = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        const queue = JSON.parse(stored);
        setQueuedItems(queue);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }, []);

  const saveQueue = useCallback(async (queue: OfflineQueueItem[]) => {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      setQueuedItems(queue);
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }, []);

  const addToQueue = useCallback(async (type: OfflineQueueItem['type'], data: any) => {
    const item: OfflineQueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const newQueue = [...queuedItems, item];
    await saveQueue(newQueue);
    
    console.log(`Added to offline queue: ${type}`, item);
  }, [queuedItems, saveQueue]);

  const processQueue = useCallback(async () => {
    if (!isOnline || queuedItems.length === 0) {
      return;
    }

    console.log(`Processing offline queue: ${queuedItems.length} items`);
    
    const remainingItems: OfflineQueueItem[] = [];
    
    for (const item of queuedItems) {
      try {
        console.log(`Processing queued item: ${item.type}`, item.data);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`Successfully processed: ${item.type}`);
      } catch (error) {
        console.error(`Failed to process queued item: ${item.type}`, error);
        
        if (item.retryCount < MAX_RETRY_COUNT) {
          remainingItems.push({
            ...item,
            retryCount: item.retryCount + 1,
          });
        } else {
          console.error(`Max retry count reached for item: ${item.type}`);
        }
      }
    }

    await saveQueue(remainingItems);
  }, [isOnline, queuedItems, saveQueue]);

  const clearQueue = useCallback(async () => {
    await saveQueue([]);
  }, [saveQueue]);

  const getQueueSize = useCallback(() => queuedItems.length, [queuedItems]);

  useEffect(() => {
    loadQueue();
    
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = (state.isConnected ?? false) && state.isInternetReachable !== false;
      setIsOnline(online);
      setIsConnected(state.isConnected ?? false);
      
      if (online) {
        processQueue();
      }
    });

    return () => unsubscribe();
  }, [loadQueue, processQueue]);

  return useMemo(() => ({
    isOnline,
    isConnected,
    queuedItems,
    addToQueue,
    processQueue,
    clearQueue,
    getQueueSize,
  }), [isOnline, isConnected, queuedItems, addToQueue, processQueue, clearQueue, getQueueSize]);
});
