import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomerActivity {
  id: string;
  customerId: string;
  customerName: string;
  type: 'debt_added' | 'payment_made' | 'profile_viewed' | 'profile_updated' | 'note_added';
  description: string;
  amount?: number;
  timestamp: string;
  employeeId: string;
  employeeName: string;
  metadata?: Record<string, any>;
}

const ACTIVITY_STORAGE_KEY = 'customer_activities';
const MAX_ACTIVITIES = 1000; // Keep only the latest 1000 activities

export class ActivityLogger {
  private static instance: ActivityLogger;
  
  private constructor() {}
  
  public static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  /**
   * Log a customer activity
   */
  async logActivity(activity: Omit<CustomerActivity, 'id' | 'timestamp'>): Promise<void> {
    try {
      const activities = await this.getActivities();
      
      const newActivity: CustomerActivity = {
        ...activity,
        id: this.generateId(),
        timestamp: new Date().toISOString(),
      };

      // Add new activity to the beginning of the array
      activities.unshift(newActivity);

      // Keep only the latest MAX_ACTIVITIES
      if (activities.length > MAX_ACTIVITIES) {
        activities.splice(MAX_ACTIVITIES);
      }

      await AsyncStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
      
      console.log('Activity logged:', newActivity);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Get all activities with optional filtering
   */
  async getActivities(options?: {
    customerId?: string;
    type?: CustomerActivity['type'];
    limit?: number;
    offset?: number;
  }): Promise<CustomerActivity[]> {
    try {
      const stored = await AsyncStorage.getItem(ACTIVITY_STORAGE_KEY);
      let activities: CustomerActivity[] = stored ? JSON.parse(stored) : [];

      // Apply filters
      if (options?.customerId) {
        activities = activities.filter(a => a.customerId === options.customerId);
      }

      if (options?.type) {
        activities = activities.filter(a => a.type === options.type);
      }

      // Apply pagination
      const offset = options?.offset || 0;
      const limit = options?.limit || activities.length;
      
      return activities.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get activities:', error);
      return [];
    }
  }

  /**
   * Get activity summary statistics
   */
  async getActivitySummary(customerId?: string): Promise<{
    totalDebtAdded: number;
    totalPaymentsMade: number;
    profileViews: number;
    profileUpdates: number;
    totalActivities: number;
  }> {
    try {
      const activities = await this.getActivities({ customerId });
      
      return {
        totalDebtAdded: activities
          .filter(a => a.type === 'debt_added')
          .reduce((sum, a) => sum + (a.amount || 0), 0),
        totalPaymentsMade: activities
          .filter(a => a.type === 'payment_made')
          .reduce((sum, a) => sum + (a.amount || 0), 0),
        profileViews: activities.filter(a => a.type === 'profile_viewed').length,
        profileUpdates: activities.filter(a => a.type === 'profile_updated').length,
        totalActivities: activities.length,
      };
    } catch (error) {
      console.error('Failed to get activity summary:', error);
      return {
        totalDebtAdded: 0,
        totalPaymentsMade: 0,
        profileViews: 0,
        profileUpdates: 0,
        totalActivities: 0,
      };
    }
  }

  /**
   * Clear all activities (for testing or reset purposes)
   */
  async clearActivities(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVITY_STORAGE_KEY);
      console.log('All activities cleared');
    } catch (error) {
      console.error('Failed to clear activities:', error);
    }
  }

  /**
   * Generate a unique ID for activities
   */
  private generateId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Convenience functions for common activity types
export const logDebtAdded = async (
  customerId: string,
  customerName: string,
  amount: number,
  employeeId: string,
  employeeName: string,
  metadata?: Record<string, any>
) => {
  const logger = ActivityLogger.getInstance();
  await logger.logActivity({
    customerId,
    customerName,
    type: 'debt_added',
    description: `زیادکردنی قەرزی نوێ بە بڕی ${amount.toLocaleString()} د.ع`,
    amount,
    employeeId,
    employeeName,
    metadata,
  });
};

export const logPaymentMade = async (
  customerId: string,
  customerName: string,
  amount: number,
  employeeId: string,
  employeeName: string,
  metadata?: Record<string, any>
) => {
  const logger = ActivityLogger.getInstance();
  await logger.logActivity({
    customerId,
    customerName,
    type: 'payment_made',
    description: `پارەدانی بڕی ${amount.toLocaleString()} د.ع`,
    amount,
    employeeId,
    employeeName,
    metadata,
  });
};

export const logProfileViewed = async (
  customerId: string,
  customerName: string,
  employeeId: string,
  employeeName: string
) => {
  const logger = ActivityLogger.getInstance();
  await logger.logActivity({
    customerId,
    customerName,
    type: 'profile_viewed',
    description: 'بینینی زانیاری کڕیار',
    employeeId,
    employeeName,
  });
};

export const logProfileUpdated = async (
  customerId: string,
  customerName: string,
  employeeId: string,
  employeeName: string,
  changes?: string[]
) => {
  const logger = ActivityLogger.getInstance();
  await logger.logActivity({
    customerId,
    customerName,
    type: 'profile_updated',
    description: 'نوێکردنەوەی زانیاری کڕیار',
    employeeId,
    employeeName,
    metadata: { changes },
  });
};

export const logNoteAdded = async (
  customerId: string,
  customerName: string,
  employeeId: string,
  employeeName: string,
  note: string
) => {
  const logger = ActivityLogger.getInstance();
  await logger.logActivity({
    customerId,
    customerName,
    type: 'note_added',
    description: 'زیادکردنی تێبینی نوێ',
    employeeId,
    employeeName,
    metadata: { note },
  });
};

// Export the singleton instance
export const activityLogger = ActivityLogger.getInstance();