export interface IPRecord {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  firstSeenAt: string;
  lastSeenAt: string;
  loginCount: number;
  isKnown: boolean;
  isTrusted: boolean;
  isBlocked: boolean;
}

export interface IPAlert {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string;
  alertType: 'unknown_ip' | 'suspicious_location' | 'multiple_devices' | 'blocked_ip';
  severity: 'low' | 'medium' | 'high';
  description: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  status: 'pending' | 'resolved' | 'ignored';
}

export interface IPFilters {
  userId?: string;
  ipAddress?: string;
  isKnown?: boolean;
  isTrusted?: boolean;
  isBlocked?: boolean;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'user' | 'loginCount';
  sortOrder?: 'asc' | 'desc';
}

export interface IPStats {
  totalIPs: number;
  knownIPs: number;
  unknownIPs: number;
  blockedIPs: number;
  activeIPs: number;
  ipsByUser: {
    userId: string;
    userName: string;
    ipCount: number;
    lastIP: string;
  }[];
  recentLogins: {
    userId: string;
    userName: string;
    ipAddress: string;
    loginAt: string;
    isKnown: boolean;
  }[];
}

export interface IPSecurityReport {
  totalLogins: number;
  uniqueIPs: number;
  suspiciousLogins: number;
  blockedAttempts: number;
  alerts: IPAlert[];
  topIPs: {
    ipAddress: string;
    loginCount: number;
    users: string[];
  }[];
  loginsByTime: {
    hour: number;
    count: number;
  }[];
  loginsByLocation: {
    location: string;
    count: number;
  }[];
}
