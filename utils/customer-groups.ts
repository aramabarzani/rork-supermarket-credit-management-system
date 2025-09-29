import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  customerIds: string[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface GroupMember {
  customerId: string;
  customerName: string;
  customerPhone: string;
  joinedAt: string;
  addedBy: string;
}

const GROUPS_STORAGE_KEY = 'customer_groups';

export class CustomerGroupManager {
  private static instance: CustomerGroupManager;
  
  private constructor() {}
  
  public static getInstance(): CustomerGroupManager {
    if (!CustomerGroupManager.instance) {
      CustomerGroupManager.instance = new CustomerGroupManager();
    }
    return CustomerGroupManager.instance;
  }

  /**
   * Create a new customer group
   */
  async createGroup(
    name: string,
    description?: string,
    color?: string,
    createdBy: string = 'admin'
  ): Promise<CustomerGroup> {
    try {
      const groups = await this.getGroups();
      
      // Check if group name already exists
      if (groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('گرووپێک بەم ناوە پێشتر دروستکراوە');
      }

      const newGroup: CustomerGroup = {
        id: this.generateId(),
        name,
        description,
        color: color || this.getRandomColor(),
        customerIds: [],
        createdAt: new Date().toISOString(),
        createdBy,
      };

      groups.push(newGroup);
      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
      
      console.log('Group created:', newGroup);
      return newGroup;
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  }

  /**
   * Get all groups
   */
  async getGroups(): Promise<CustomerGroup[]> {
    try {
      const stored = await AsyncStorage.getItem(GROUPS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultGroups();
    } catch (error) {
      console.error('Failed to get groups:', error);
      return this.getDefaultGroups();
    }
  }

  /**
   * Get a specific group by ID
   */
  async getGroup(groupId: string): Promise<CustomerGroup | null> {
    try {
      const groups = await this.getGroups();
      return groups.find(g => g.id === groupId) || null;
    } catch (error) {
      console.error('Failed to get group:', error);
      return null;
    }
  }

  /**
   * Update a group
   */
  async updateGroup(
    groupId: string,
    updates: Partial<Pick<CustomerGroup, 'name' | 'description' | 'color'>>,
    updatedBy: string = 'admin'
  ): Promise<CustomerGroup | null> {
    try {
      const groups = await this.getGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) {
        throw new Error('گرووپ نەدۆزرایەوە');
      }

      // Check if new name conflicts with existing groups
      if (updates.name && updates.name !== groups[groupIndex].name) {
        if (groups.some(g => g.id !== groupId && g.name.toLowerCase() === updates.name!.toLowerCase())) {
          throw new Error('گرووپێک بەم ناوە پێشتر دروستکراوە');
        }
      }

      groups[groupIndex] = {
        ...groups[groupIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy,
      };

      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
      
      console.log('Group updated:', groups[groupIndex]);
      return groups[groupIndex];
    } catch (error) {
      console.error('Failed to update group:', error);
      throw error;
    }
  }

  /**
   * Delete a group
   */
  async deleteGroup(groupId: string): Promise<boolean> {
    try {
      const groups = await this.getGroups();
      const filteredGroups = groups.filter(g => g.id !== groupId);
      
      if (filteredGroups.length === groups.length) {
        throw new Error('گرووپ نەدۆزرایەوە');
      }

      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(filteredGroups));
      
      console.log('Group deleted:', groupId);
      return true;
    } catch (error) {
      console.error('Failed to delete group:', error);
      throw error;
    }
  }

  /**
   * Add customer to group
   */
  async addCustomerToGroup(
    groupId: string,
    customerId: string,
    addedBy: string = 'admin'
  ): Promise<boolean> {
    try {
      const groups = await this.getGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) {
        throw new Error('گرووپ نەدۆزرایەوە');
      }

      if (groups[groupIndex].customerIds.includes(customerId)) {
        throw new Error('کڕیار پێشتر لەم گرووپەدایە');
      }

      groups[groupIndex].customerIds.push(customerId);
      groups[groupIndex].updatedAt = new Date().toISOString();
      groups[groupIndex].updatedBy = addedBy;

      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
      
      console.log('Customer added to group:', { groupId, customerId });
      return true;
    } catch (error) {
      console.error('Failed to add customer to group:', error);
      throw error;
    }
  }

  /**
   * Remove customer from group
   */
  async removeCustomerFromGroup(
    groupId: string,
    customerId: string,
    removedBy: string = 'admin'
  ): Promise<boolean> {
    try {
      const groups = await this.getGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) {
        throw new Error('گرووپ نەدۆزرایەوە');
      }

      const customerIndex = groups[groupIndex].customerIds.indexOf(customerId);
      if (customerIndex === -1) {
        throw new Error('کڕیار لەم گرووپەدا نیە');
      }

      groups[groupIndex].customerIds.splice(customerIndex, 1);
      groups[groupIndex].updatedAt = new Date().toISOString();
      groups[groupIndex].updatedBy = removedBy;

      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
      
      console.log('Customer removed from group:', { groupId, customerId });
      return true;
    } catch (error) {
      console.error('Failed to remove customer from group:', error);
      throw error;
    }
  }

  /**
   * Get groups for a specific customer
   */
  async getCustomerGroups(customerId: string): Promise<CustomerGroup[]> {
    try {
      const groups = await this.getGroups();
      return groups.filter(g => g.customerIds.includes(customerId));
    } catch (error) {
      console.error('Failed to get customer groups:', error);
      return [];
    }
  }

  /**
   * Get group statistics
   */
  async getGroupStats(): Promise<{
    totalGroups: number;
    totalCustomersInGroups: number;
    averageCustomersPerGroup: number;
    largestGroup: { name: string; count: number } | null;
  }> {
    try {
      const groups = await this.getGroups();
      const totalGroups = groups.length;
      const totalCustomersInGroups = groups.reduce((sum, g) => sum + g.customerIds.length, 0);
      const averageCustomersPerGroup = totalGroups > 0 ? totalCustomersInGroups / totalGroups : 0;
      
      let largestGroup = null;
      if (groups.length > 0) {
        const largest = groups.reduce((max, g) => 
          g.customerIds.length > max.customerIds.length ? g : max
        );
        largestGroup = {
          name: largest.name,
          count: largest.customerIds.length,
        };
      }

      return {
        totalGroups,
        totalCustomersInGroups,
        averageCustomersPerGroup,
        largestGroup,
      };
    } catch (error) {
      console.error('Failed to get group stats:', error);
      return {
        totalGroups: 0,
        totalCustomersInGroups: 0,
        averageCustomersPerGroup: 0,
        largestGroup: null,
      };
    }
  }

  /**
   * Search groups by name
   */
  async searchGroups(query: string): Promise<CustomerGroup[]> {
    try {
      const groups = await this.getGroups();
      const lowercaseQuery = query.toLowerCase();
      return groups.filter(g => 
        g.name.toLowerCase().includes(lowercaseQuery) ||
        (g.description && g.description.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Failed to search groups:', error);
      return [];
    }
  }

  /**
   * Initialize with default groups
   */
  private getDefaultGroups(): CustomerGroup[] {
    return [
      {
        id: 'group_vip',
        name: 'VIP',
        description: 'کڕیارانی تایبەت و گرنگ',
        color: '#ffd700',
        customerIds: [],
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
      {
        id: 'group_regular',
        name: 'ئاسایی',
        description: 'کڕیارانی ئاسایی',
        color: '#4caf50',
        customerIds: [],
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
      {
        id: 'group_new',
        name: 'نوێ',
        description: 'کڕیارانی نوێ',
        color: '#2196f3',
        customerIds: [],
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
      {
        id: 'group_family',
        name: 'خانوادە',
        description: 'کڕیارانی خانوادە',
        color: '#ff9800',
        customerIds: [],
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
    ];
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get a random color for new groups
   */
  private getRandomColor(): string {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7',
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// Export the singleton instance
export const customerGroupManager = CustomerGroupManager.getInstance();