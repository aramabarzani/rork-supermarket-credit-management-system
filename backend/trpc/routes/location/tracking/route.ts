import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const locationDataSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number(),
  timestamp: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const deviceInfoSchema = z.object({
  platform: z.string(),
  browser: z.string().optional(),
  os: z.string().optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
});

export const recordLoginActivityProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      userName: z.string(),
      userRole: z.enum(['admin', 'employee', 'customer']),
      location: locationDataSchema,
      ipAddress: z.string(),
      deviceInfo: deviceInfoSchema,
    })
  )
  .mutation(async ({ input }) => {
    const activity = {
      id: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      loginTime: new Date().toISOString(),
      status: 'active' as const,
    };

    console.log('Login activity recorded:', activity);
    return { success: true, activity };
  });

export const recordLogoutActivityProcedure = publicProcedure
  .input(
    z.object({
      activityId: z.string(),
      location: locationDataSchema.optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Logout activity recorded:', input);
    return { success: true, logoutTime: new Date().toISOString() };
  });

export const getLoginActivitiesProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      userRole: z.enum(['admin', 'employee', 'customer']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.enum(['active', 'ended']).optional(),
    })
  )
  .query(async ({ input }) => {
    const mockActivities = [
      {
        id: 'activity_1',
        userId: 'user_1',
        userName: 'ئەحمەد محەمەد',
        userRole: 'employee' as const,
        loginTime: new Date(Date.now() - 3600000).toISOString(),
        location: {
          latitude: 36.1911,
          longitude: 44.0092,
          accuracy: 10,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          address: 'هەولێر، عێراق',
          city: 'هەولێر',
          country: 'عێراق',
        },
        ipAddress: '192.168.1.100',
        deviceInfo: {
          platform: 'iOS',
          browser: 'Safari',
          os: 'iOS 17',
          deviceType: 'mobile' as const,
        },
        sessionDuration: 3600,
        status: 'active' as const,
      },
      {
        id: 'activity_2',
        userId: 'user_2',
        userName: 'سارا ئەحمەد',
        userRole: 'customer' as const,
        loginTime: new Date(Date.now() - 7200000).toISOString(),
        logoutTime: new Date(Date.now() - 1800000).toISOString(),
        location: {
          latitude: 36.1911,
          longitude: 44.0092,
          accuracy: 15,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          address: 'سلێمانی، عێراق',
          city: 'سلێمانی',
          country: 'عێراق',
        },
        ipAddress: '192.168.1.101',
        deviceInfo: {
          platform: 'Android',
          browser: 'Chrome',
          os: 'Android 14',
          deviceType: 'mobile' as const,
        },
        sessionDuration: 5400,
        status: 'ended' as const,
      },
    ];

    return mockActivities;
  });

export const getActivitySessionsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const mockSessions = [
      {
        id: 'session_1',
        userId: 'user_1',
        userName: 'ئەحمەد محەمەد',
        userRole: 'employee' as const,
        startTime: new Date(Date.now() - 7200000).toISOString(),
        endTime: new Date(Date.now() - 3600000).toISOString(),
        startLocation: {
          latitude: 36.1911,
          longitude: 44.0092,
          accuracy: 10,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          address: 'هەولێر، عێراق',
          city: 'هەولێر',
          country: 'عێراق',
        },
        endLocation: {
          latitude: 36.1915,
          longitude: 44.0095,
          accuracy: 12,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          address: 'هەولێر، عێراق',
          city: 'هەولێر',
          country: 'عێراق',
        },
        actions: [
          {
            id: 'action_1',
            sessionId: 'session_1',
            actionType: 'view_customer',
            actionDescription: 'بینینی زانیاری کڕیار',
            timestamp: new Date(Date.now() - 6900000).toISOString(),
          },
          {
            id: 'action_2',
            sessionId: 'session_1',
            actionType: 'add_payment',
            actionDescription: 'زیادکردنی پارەدان',
            timestamp: new Date(Date.now() - 6600000).toISOString(),
          },
        ],
        totalDuration: 3600,
      },
    ];

    return mockSessions;
  });

export const getLocationReportProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })
  )
  .query(async ({ input }) => {
    const mockReport = {
      userId: input.userId,
      userName: 'ئەحمەد محەمەد',
      userRole: 'employee' as const,
      period: {
        startDate: input.startDate,
        endDate: input.endDate,
      },
      totalSessions: 15,
      totalDuration: 54000,
      locations: [
        {
          location: {
            latitude: 36.1911,
            longitude: 44.0092,
            accuracy: 10,
            timestamp: new Date().toISOString(),
            address: 'هەولێر، عێراق',
            city: 'هەولێر',
            country: 'عێراق',
          },
          visitCount: 12,
          totalTime: 43200,
        },
        {
          location: {
            latitude: 36.1915,
            longitude: 44.0095,
            accuracy: 12,
            timestamp: new Date().toISOString(),
            address: 'سلێمانی، عێراق',
            city: 'سلێمانی',
            country: 'عێراق',
          },
          visitCount: 3,
          totalTime: 10800,
        },
      ],
      activities: [],
    };

    return mockReport;
  });

export const getLocationSettingsProcedure = publicProcedure.query(async () => {
  return {
    enableLocationTracking: true,
    trackEmployeeLocation: true,
    trackCustomerLocation: false,
    requireLocationForLogin: false,
    locationUpdateInterval: 300,
    allowedLocations: [
      {
        latitude: 36.1911,
        longitude: 44.0092,
        radius: 1000,
        name: 'فرۆشگای سەرەکی',
      },
    ],
    restrictLoginByLocation: false,
  };
});

export const updateLocationSettingsProcedure = publicProcedure
  .input(
    z.object({
      enableLocationTracking: z.boolean(),
      trackEmployeeLocation: z.boolean(),
      trackCustomerLocation: z.boolean(),
      requireLocationForLogin: z.boolean(),
      locationUpdateInterval: z.number(),
      allowedLocations: z
        .array(
          z.object({
            latitude: z.number(),
            longitude: z.number(),
            radius: z.number(),
            name: z.string(),
          })
        )
        .optional(),
      restrictLoginByLocation: z.boolean(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Location settings updated:', input);
    return { success: true, settings: input };
  });

export const getLocationAlertsProcedure = publicProcedure
  .input(
    z.object({
      resolved: z.boolean().optional(),
      severity: z.enum(['low', 'medium', 'high']).optional(),
    })
  )
  .query(async ({ input }) => {
    const mockAlerts = [
      {
        id: 'alert_1',
        userId: 'user_1',
        userName: 'ئەحمەد محەمەد',
        alertType: 'unauthorized_location' as const,
        message: 'چوونەژوورەوە لە شوێنێکی نامۆ',
        location: {
          latitude: 36.2911,
          longitude: 44.1092,
          accuracy: 20,
          timestamp: new Date().toISOString(),
          address: 'شوێنی نامۆ',
          city: 'نەزانراو',
          country: 'عێراق',
        },
        timestamp: new Date().toISOString(),
        severity: 'high' as const,
        resolved: false,
      },
    ];

    return mockAlerts;
  });

export const resolveLocationAlertProcedure = publicProcedure
  .input(
    z.object({
      alertId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Alert resolved:', input.alertId);
    return { success: true };
  });
