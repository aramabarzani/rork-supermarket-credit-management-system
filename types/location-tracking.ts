export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface LoginActivity {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'employee' | 'customer';
  loginTime: string;
  logoutTime?: string;
  location: LocationData;
  ipAddress: string;
  deviceInfo: {
    platform: string;
    browser?: string;
    os?: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
  };
  sessionDuration?: number;
  status: 'active' | 'ended';
}

export interface ActivitySession {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'employee' | 'customer';
  startTime: string;
  endTime?: string;
  startLocation: LocationData;
  endLocation?: LocationData;
  actions: ActivityAction[];
  totalDuration?: number;
}

export interface ActivityAction {
  id: string;
  sessionId: string;
  actionType: string;
  actionDescription: string;
  timestamp: string;
  location?: LocationData;
  metadata?: Record<string, any>;
}

export interface LocationSettings {
  enableLocationTracking: boolean;
  trackEmployeeLocation: boolean;
  trackCustomerLocation: boolean;
  requireLocationForLogin: boolean;
  locationUpdateInterval: number;
  allowedLocations?: {
    latitude: number;
    longitude: number;
    radius: number;
    name: string;
  }[];
  restrictLoginByLocation: boolean;
}

export interface LocationReport {
  userId: string;
  userName: string;
  userRole: 'admin' | 'employee' | 'customer';
  period: {
    startDate: string;
    endDate: string;
  };
  totalSessions: number;
  totalDuration: number;
  locations: {
    location: LocationData;
    visitCount: number;
    totalTime: number;
  }[];
  activities: ActivityAction[];
}

export interface LocationAlert {
  id: string;
  userId: string;
  userName: string;
  alertType: 'unauthorized_location' | 'suspicious_activity' | 'location_mismatch';
  message: string;
  location: LocationData;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}
