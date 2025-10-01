import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { ProfileImage, ProfileChange, ProfileChangeFilters, ProfileStats } from '@/types/profile';

const sampleChanges: ProfileChange[] = [
  {
    id: 'change-1',
    userId: 'user-1',
    userName: 'ئەحمەد محەمەد',
    changeType: 'phone',
    fieldName: 'ژمارەی تەلەفۆن',
    oldValue: '07501234567',
    newValue: '07507654321',
    changedBy: 'admin',
    changedByName: 'بەڕێوەبەر',
    changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.100',
  },
  {
    id: 'change-2',
    userId: 'user-2',
    userName: 'فاتیمە ئەحمەد',
    changeType: 'image',
    fieldName: 'وێنەی پرۆفایل',
    oldValue: 'old-image.jpg',
    newValue: 'new-image.jpg',
    changedBy: 'user-2',
    changedByName: 'فاتیمە ئەحمەد',
    changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.101',
  },
];

const sampleImages: ProfileImage[] = [];

export const [ProfileTrackingProvider, useProfileTracking] = createContextHook(() => {
  const [changes, setChanges] = useState<ProfileChange[]>(sampleChanges);
  const [images, setImages] = useState<ProfileImage[]>(sampleImages);
  const [isLoading, setIsLoading] = useState(false);

  const logChange = useCallback(async (change: Omit<ProfileChange, 'id' | 'changedAt'>) => {
    setIsLoading(true);
    try {
      const newChange: ProfileChange = {
        ...change,
        id: `change-${Date.now()}`,
        changedAt: new Date().toISOString(),
      };
      setChanges(prev => [newChange, ...prev]);
      console.log('Profile change logged:', newChange);
      return newChange;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadProfileImage = useCallback(async (image: Omit<ProfileImage, 'id' | 'uploadedAt'>) => {
    setIsLoading(true);
    try {
      const newImage: ProfileImage = {
        ...image,
        id: `img-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      setImages(prev => [newImage, ...prev]);
      console.log('Profile image uploaded:', newImage);
      return newImage;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChangesByUser = useCallback((userId: string) => {
    return changes.filter(change => change.userId === userId);
  }, [changes]);

  const getImagesByUser = useCallback((userId: string) => {
    return images.filter(image => image.userId === userId);
  }, [images]);

  const searchChanges = useCallback((filters: ProfileChangeFilters) => {
    let filtered = [...changes];

    if (filters.userId) {
      filtered = filtered.filter(change => change.userId === filters.userId);
    }

    if (filters.changeType) {
      filtered = filtered.filter(change => change.changeType === filters.changeType);
    }

    if (filters.changedBy) {
      filtered = filtered.filter(change => change.changedBy === filters.changedBy);
    }

    if (filters.startDate) {
      filtered = filtered.filter(change => 
        new Date(change.changedAt) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(change => 
        new Date(change.changedAt) <= new Date(filters.endDate!)
      );
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.changedAt);
            bValue = new Date(b.changedAt);
            break;
          case 'user':
            aValue = a.userName;
            bValue = b.userName;
            break;
          case 'type':
            aValue = a.changeType;
            bValue = b.changeType;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filtered;
  }, [changes]);

  const getStats = useCallback((): ProfileStats => {
    const changesByType: Record<string, number> = {};
    changes.forEach(change => {
      changesByType[change.changeType] = (changesByType[change.changeType] || 0) + 1;
    });

    const recentChanges = [...changes]
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, 10);

    const userChangeCounts = new Map<string, { userId: string; userName: string; count: number }>();
    changes.forEach(change => {
      const existing = userChangeCounts.get(change.userId) || {
        userId: change.userId,
        userName: change.userName,
        count: 0,
      };
      existing.count += 1;
      userChangeCounts.set(change.userId, existing);
    });

    const mostActiveUsers = Array.from(userChangeCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ userId, userName, count }) => ({
        userId,
        userName,
        changeCount: count,
      }));

    return {
      totalChanges: changes.length,
      changesByType,
      recentChanges,
      mostActiveUsers,
    };
  }, [changes]);

  const exportChanges = useCallback((format: 'json' | 'csv' = 'json') => {
    if (format === 'json') {
      return JSON.stringify(changes, null, 2);
    }

    const csvLines = ['ID,بەکارهێنەر,جۆری گۆڕانکاری,خانە,نرخی کۆن,نرخی نوێ,گۆڕدراو لەلایەن,بەروار'];
    changes.forEach(change => {
      csvLines.push(
        `${change.id},${change.userName},${change.changeType},${change.fieldName},${change.oldValue},${change.newValue},${change.changedByName},${change.changedAt}`
      );
    });
    return csvLines.join('\n');
  }, [changes]);

  return useMemo(() => ({
    changes,
    images,
    isLoading,
    logChange,
    uploadProfileImage,
    getChangesByUser,
    getImagesByUser,
    searchChanges,
    getStats,
    exportChanges,
  }), [changes, images, isLoading, logChange, uploadProfileImage, getChangesByUser, getImagesByUser, searchChanges, getStats, exportChanges]);
});
