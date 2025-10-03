import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { safeStorage } from '@/utils/storage';
import { StoreRequest, StoreRequestStats } from '@/types/store-request';

export const [StoreRequestProvider, useStoreRequests] = createContextHook(() => {
  const [requests, setRequests] = useState<StoreRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const stored = await safeStorage.getGlobalItem<StoreRequest[]>('store_requests', []);
      if (stored) {
        setRequests(stored);
      }
    } catch (error) {
      console.error('Failed to load store requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRequests = useCallback(async (updatedRequests: StoreRequest[]) => {
    try {
      await safeStorage.setGlobalItem('store_requests', updatedRequests);
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Failed to save store requests:', error);
      throw error;
    }
  }, []);

  const createRequest = useCallback(async (request: Omit<StoreRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: StoreRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await saveRequests([...requests, newRequest]);
    return newRequest;
  }, [requests, saveRequests]);

  const approveRequest = useCallback(async (id: string, reviewedBy: string, notes?: string) => {
    const updated = requests.map(r => {
      if (r.id === id) {
        const { ownerPassword, ...rest } = r;
        return {
          ...rest,
          status: 'approved' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy,
          notes,
        };
      }
      return r;
    });
    await saveRequests(updated);
    
    console.log('[Store Request] Password removed from approved request for security:', {
      requestId: id,
      note: 'Password is now only stored in the new tenant user account',
    });
    
    return updated.find(r => r.id === id);
  }, [requests, saveRequests]);

  const rejectRequest = useCallback(async (id: string, reviewedBy: string, rejectionReason: string) => {
    const updated = requests.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'rejected' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy,
            rejectionReason,
          }
        : r
    );
    await saveRequests(updated);
  }, [requests, saveRequests]);

  const cancelRequest = useCallback(async (id: string) => {
    const updated = requests.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'cancelled' as const,
          }
        : r
    );
    await saveRequests(updated);
  }, [requests, saveRequests]);

  const linkTenant = useCallback(async (requestId: string, tenantId: string) => {
    const updated = requests.map(r =>
      r.id === requestId
        ? {
            ...r,
            tenantId,
          }
        : r
    );
    await saveRequests(updated);
  }, [requests, saveRequests]);

  const deleteRequest = useCallback(async (id: string) => {
    const updated = requests.filter(r => r.id !== id);
    await saveRequests(updated);
  }, [requests, saveRequests]);

  const getRequestById = useCallback((id: string) => {
    return requests.find(r => r.id === id);
  }, [requests]);

  const getPendingRequests = useCallback(() => {
    return requests.filter(r => r.status === 'pending');
  }, [requests]);

  const getApprovedRequests = useCallback(() => {
    return requests.filter(r => r.status === 'approved');
  }, [requests]);

  const getRejectedRequests = useCallback(() => {
    return requests.filter(r => r.status === 'rejected');
  }, [requests]);

  const getStats = useCallback((): StoreRequestStats => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
    };
  }, [requests]);

  return useMemo(() => ({
    requests,
    isLoading,
    createRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    linkTenant,
    deleteRequest,
    getRequestById,
    getPendingRequests,
    getApprovedRequests,
    getRejectedRequests,
    getStats,
  }), [
    requests,
    isLoading,
    createRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    linkTenant,
    deleteRequest,
    getRequestById,
    getPendingRequests,
    getApprovedRequests,
    getRejectedRequests,
    getStats,
  ]);
});
