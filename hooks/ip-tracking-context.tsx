import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { IPRecord, IPAlert, IPFilters, IPStats, IPSecurityReport } from '@/types/ip-tracking';

const sampleIPRecords: IPRecord[] = [
  {
    id: 'ip-1',
    userId: 'user-1',
    userName: 'ئەحمەد محەمەد',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    deviceType: 'desktop',
    location: {
      country: 'Iraq',
      city: 'Erbil',
      region: 'Kurdistan',
    },
    firstSeenAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastSeenAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    loginCount: 45,
    isKnown: true,
    isTrusted: true,
    isBlocked: false,
  },
  {
    id: 'ip-2',
    userId: 'user-2',
    userName: 'فاتیمە ئەحمەد',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
    deviceType: 'mobile',
    location: {
      country: 'Iraq',
      city: 'Sulaymaniyah',
      region: 'Kurdistan',
    },
    firstSeenAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastSeenAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    loginCount: 23,
    isKnown: true,
    isTrusted: true,
    isBlocked: false,
  },
  {
    id: 'ip-3',
    userId: 'user-1',
    userName: 'ئەحمەد محەمەد',
    ipAddress: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    deviceType: 'desktop',
    location: {
      country: 'Unknown',
      city: 'Unknown',
    },
    firstSeenAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    lastSeenAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    loginCount: 1,
    isKnown: false,
    isTrusted: false,
    isBlocked: false,
  },
];

const sampleAlerts: IPAlert[] = [
  {
    id: 'alert-1',
    userId: 'user-1',
    userName: 'ئەحمەد محەمەد',
    ipAddress: '203.0.113.45',
    alertType: 'unknown_ip',
    severity: 'medium',
    description: 'چوونەژوورەوە لە IPیەکی نەناسراو',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
];

export const [IPTrackingProvider, useIPTracking] = createContextHook(() => {
  const [ipRecords, setIPRecords] = useState<IPRecord[]>(sampleIPRecords);
  const [alerts, setAlerts] = useState<IPAlert[]>(sampleAlerts);
  const [isLoading, setIsLoading] = useState(false);

  const trackIP = useCallback(async (record: Omit<IPRecord, 'id' | 'firstSeenAt' | 'lastSeenAt' | 'loginCount'>) => {
    setIsLoading(true);
    try {
      const existing = ipRecords.find(
        r => r.userId === record.userId && r.ipAddress === record.ipAddress
      );

      if (existing) {
        setIPRecords(prev => prev.map(r => 
          r.id === existing.id
            ? { ...r, lastSeenAt: new Date().toISOString(), loginCount: r.loginCount + 1 }
            : r
        ));
        console.log('IP record updated:', existing.id);
        return existing;
      } else {
        const newRecord: IPRecord = {
          ...record,
          id: `ip-${Date.now()}`,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
          loginCount: 1,
        };
        setIPRecords(prev => [newRecord, ...prev]);
        console.log('New IP record created:', newRecord);

        if (!newRecord.isKnown) {
          const alert: IPAlert = {
            id: `alert-${Date.now()}`,
            userId: newRecord.userId,
            userName: newRecord.userName,
            ipAddress: newRecord.ipAddress,
            alertType: 'unknown_ip',
            severity: 'medium',
            description: `چوونەژوورەوە لە IPیەکی نەناسراو: ${newRecord.ipAddress}`,
            createdAt: new Date().toISOString(),
            status: 'pending',
          };
          setAlerts(prev => [alert, ...prev]);
          console.log('IP alert created:', alert);
        }

        return newRecord;
      }
    } finally {
      setIsLoading(false);
    }
  }, [ipRecords]);

  const trustIP = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      setIPRecords(prev => prev.map(record => 
        record.id === id ? { ...record, isTrusted: true, isKnown: true } : record
      ));
      console.log('IP trusted:', id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const blockIP = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      setIPRecords(prev => prev.map(record => 
        record.id === id ? { ...record, isBlocked: true } : record
      ));
      console.log('IP blocked:', id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (id: string, resolvedBy: string) => {
    setIsLoading(true);
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === id 
          ? { ...alert, status: 'resolved' as const, resolvedAt: new Date().toISOString(), resolvedBy }
          : alert
      ));
      console.log('Alert resolved:', id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getIPsByUser = useCallback((userId: string) => {
    return ipRecords.filter(record => record.userId === userId);
  }, [ipRecords]);

  const getAlertsByUser = useCallback((userId: string) => {
    return alerts.filter(alert => alert.userId === userId);
  }, [alerts]);

  const searchIPs = useCallback((filters: IPFilters) => {
    let filtered = [...ipRecords];

    if (filters.userId) {
      filtered = filtered.filter(record => record.userId === filters.userId);
    }

    if (filters.ipAddress) {
      filtered = filtered.filter(record => record.ipAddress.includes(filters.ipAddress!));
    }

    if (filters.isKnown !== undefined) {
      filtered = filtered.filter(record => record.isKnown === filters.isKnown);
    }

    if (filters.isTrusted !== undefined) {
      filtered = filtered.filter(record => record.isTrusted === filters.isTrusted);
    }

    if (filters.isBlocked !== undefined) {
      filtered = filtered.filter(record => record.isBlocked === filters.isBlocked);
    }

    if (filters.startDate) {
      filtered = filtered.filter(record => 
        new Date(record.lastSeenAt) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(record => 
        new Date(record.lastSeenAt) <= new Date(filters.endDate!)
      );
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.lastSeenAt);
            bValue = new Date(b.lastSeenAt);
            break;
          case 'user':
            aValue = a.userName;
            bValue = b.userName;
            break;
          case 'loginCount':
            aValue = a.loginCount;
            bValue = b.loginCount;
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
  }, [ipRecords]);

  const getStats = useCallback((): IPStats => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const ipsByUser = new Map<string, { userId: string; userName: string; ips: string[]; lastIP: string }>();
    ipRecords.forEach(record => {
      const existing = ipsByUser.get(record.userId) || {
        userId: record.userId,
        userName: record.userName,
        ips: [],
        lastIP: '',
      };
      if (!existing.ips.includes(record.ipAddress)) {
        existing.ips.push(record.ipAddress);
      }
      if (new Date(record.lastSeenAt) > new Date(existing.lastIP || 0)) {
        existing.lastIP = record.ipAddress;
      }
      ipsByUser.set(record.userId, existing);
    });

    const recentLogins = [...ipRecords]
      .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())
      .slice(0, 10)
      .map(record => ({
        userId: record.userId,
        userName: record.userName,
        ipAddress: record.ipAddress,
        loginAt: record.lastSeenAt,
        isKnown: record.isKnown,
      }));

    return {
      totalIPs: ipRecords.length,
      knownIPs: ipRecords.filter(r => r.isKnown).length,
      unknownIPs: ipRecords.filter(r => !r.isKnown).length,
      blockedIPs: ipRecords.filter(r => r.isBlocked).length,
      activeIPs: ipRecords.filter(r => new Date(r.lastSeenAt) > oneHourAgo).length,
      ipsByUser: Array.from(ipsByUser.values()).map(({ userId, userName, ips, lastIP }) => ({
        userId,
        userName,
        ipCount: ips.length,
        lastIP,
      })),
      recentLogins,
    };
  }, [ipRecords]);

  const getSecurityReport = useCallback((): IPSecurityReport => {
    const totalLogins = ipRecords.reduce((sum, record) => sum + record.loginCount, 0);
    const uniqueIPs = new Set(ipRecords.map(r => r.ipAddress)).size;
    const suspiciousLogins = ipRecords.filter(r => !r.isKnown).reduce((sum, r) => sum + r.loginCount, 0);
    const blockedAttempts = ipRecords.filter(r => r.isBlocked).reduce((sum, r) => sum + r.loginCount, 0);

    const ipCounts = new Map<string, { count: number; users: Set<string> }>();
    ipRecords.forEach(record => {
      const existing = ipCounts.get(record.ipAddress) || { count: 0, users: new Set<string>() };
      existing.count += record.loginCount;
      existing.users.add(record.userName);
      ipCounts.set(record.ipAddress, existing);
    });

    const topIPs = Array.from(ipCounts.entries())
      .map(([ipAddress, { count, users }]) => ({
        ipAddress,
        loginCount: count,
        users: Array.from(users),
      }))
      .sort((a, b) => b.loginCount - a.loginCount)
      .slice(0, 10);

    const loginsByTime = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
    }));

    const locationCounts = new Map<string, number>();
    ipRecords.forEach(record => {
      const location = record.location?.city || 'نەناسراو';
      locationCounts.set(location, (locationCounts.get(location) || 0) + record.loginCount);
    });

    const loginsByLocation = Array.from(locationCounts.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLogins,
      uniqueIPs,
      suspiciousLogins,
      blockedAttempts,
      alerts: alerts.filter(a => a.status === 'pending'),
      topIPs,
      loginsByTime,
      loginsByLocation,
    };
  }, [ipRecords, alerts]);

  const exportReport = useCallback((format: 'json' | 'csv' = 'json') => {
    const report = getSecurityReport();
    
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    const csvLines = ['نوع,نرخ'];
    csvLines.push(`کۆی چوونەژوورەوەکان,${report.totalLogins}`);
    csvLines.push(`IPە جیاوازەکان,${report.uniqueIPs}`);
    csvLines.push(`چوونەژوورەوەی گومانلێکراو,${report.suspiciousLogins}`);
    csvLines.push(`هەوڵە بلۆککراوەکان,${report.blockedAttempts}`);
    return csvLines.join('\n');
  }, [getSecurityReport]);

  return useMemo(() => ({
    ipRecords,
    alerts,
    isLoading,
    trackIP,
    trustIP,
    blockIP,
    resolveAlert,
    getIPsByUser,
    getAlertsByUser,
    searchIPs,
    getStats,
    getSecurityReport,
    exportReport,
  }), [ipRecords, alerts, isLoading, trackIP, trustIP, blockIP, resolveAlert, getIPsByUser, getAlertsByUser, searchIPs, getStats, getSecurityReport, exportReport]);
});
