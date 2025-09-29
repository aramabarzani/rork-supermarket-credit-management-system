import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import type { Customer, CustomerStats } from "../../../../../types/customer";

// Mock data - in a real app, this would come from a database
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "ئەحمەد محەمەد",
    phone: "07501234567",
    address: "هەولێر - ئەنکاوا",
    email: "ahmad@example.com",
    group: "VIP",
    rating: 5,
    totalDebt: 150000,
    totalPaid: 120000,
    lastPaymentDate: "2024-12-15",
    lastDebtDate: "2024-12-20",
    createdAt: "2024-01-15",
    createdBy: "admin",
    createdByName: "بەڕێوەبەر",
    status: "active",
    notes: "کڕیاری باش"
  },
  {
    id: "2",
    name: "فاتیمە ئەحمەد",
    phone: "07509876543",
    address: "سلێمانی - سەرچنار",
    group: "ئاسایی",
    rating: 4,
    totalDebt: 80000,
    totalPaid: 75000,
    lastPaymentDate: "2024-11-20",
    lastDebtDate: "2024-08-15",
    createdAt: "2024-08-10",
    createdBy: "emp1",
    createdByName: "کارمەند یەک",
    status: "inactive",
    notes: "کڕیاری کۆن"
  },
  {
    id: "3",
    name: "محەمەد ئەلی",
    phone: "07701234567",
    address: "دهۆک - زاخۆ",
    group: "نوێ",
    rating: 3,
    totalDebt: 250000,
    totalPaid: 50000,
    lastPaymentDate: "2024-12-10",
    lastDebtDate: "2024-12-25",
    createdAt: "2024-12-01",
    createdBy: "admin",
    createdByName: "بەڕێوەبەر",
    status: "active",
    notes: "کڕیاری نوێ"
  },
  {
    id: "4",
    name: "زەینەب حەسەن",
    phone: "07801234567",
    address: "کەرکووک - شۆڕش",
    group: "VIP",
    rating: 5,
    totalDebt: 300000,
    totalPaid: 280000,
    lastPaymentDate: "2024-12-22",
    lastDebtDate: "2024-12-23",
    createdAt: "2024-02-20",
    createdBy: "emp2",
    createdByName: "کارمەند دوو",
    status: "active",
    notes: "کڕیاری زۆر باش"
  },
  {
    id: "5",
    name: "ئاوات کەریم",
    phone: "07901234567",
    address: "هەولێر - کۆیە",
    group: "ئاسایی",
    rating: 2,
    totalDebt: 50000,
    totalPaid: 10000,
    lastPaymentDate: "2024-10-15",
    lastDebtDate: "2024-07-20",
    createdAt: "2024-07-01",
    createdBy: "emp1",
    createdByName: "کارمەند یەک",
    status: "inactive",
    notes: "کڕیاری کەم پارەدان"
  }
];

// Get inactive customers (no recent payments or debts)
export const getInactiveCustomersRoute = publicProcedure
  .query(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const inactiveCustomers = mockCustomers.filter(customer => {
      const lastActivity = customer.lastPaymentDate || customer.lastDebtDate;
      if (!lastActivity) return true;
      
      const lastActivityDate = new Date(lastActivity);
      return lastActivityDate < threeMonthsAgo || customer.status === 'inactive';
    });

    return {
      customers: inactiveCustomers,
      count: inactiveCustomers.length,
      totalDebt: inactiveCustomers.reduce((sum, c) => sum + (c.totalDebt - c.totalPaid), 0)
    };
  });

// Get new customers this month
export const getNewCustomersThisMonthRoute = publicProcedure
  .query(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newCustomers = mockCustomers.filter(customer => {
      const createdDate = new Date(customer.createdAt);
      return createdDate.getMonth() === currentMonth && 
             createdDate.getFullYear() === currentYear;
    });

    return {
      customers: newCustomers,
      count: newCustomers.length,
      totalDebt: newCustomers.reduce((sum, c) => sum + (c.totalDebt - c.totalPaid), 0)
    };
  });

// Get high debt customers this month
export const getHighDebtCustomersThisMonthRoute = publicProcedure
  .input(z.object({
    minDebt: z.number().optional().default(100000)
  }))
  .query(({ input }) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const highDebtCustomers = mockCustomers
      .filter(customer => {
        const remainingDebt = customer.totalDebt - customer.totalPaid;
        const hasRecentDebt = customer.lastDebtDate && 
          new Date(customer.lastDebtDate).getMonth() === currentMonth &&
          new Date(customer.lastDebtDate).getFullYear() === currentYear;
        
        return remainingDebt >= input.minDebt && hasRecentDebt;
      })
      .sort((a, b) => (b.totalDebt - b.totalPaid) - (a.totalDebt - a.totalPaid));

    return {
      customers: highDebtCustomers,
      count: highDebtCustomers.length,
      totalDebt: highDebtCustomers.reduce((sum, c) => sum + (c.totalDebt - c.totalPaid), 0)
    };
  });

// Get best paying customers this month
export const getBestPayingCustomersThisMonthRoute = publicProcedure
  .query(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const bestPayingCustomers = mockCustomers
      .filter(customer => {
        const hasRecentPayment = customer.lastPaymentDate && 
          new Date(customer.lastPaymentDate).getMonth() === currentMonth &&
          new Date(customer.lastPaymentDate).getFullYear() === currentYear;
        
        return hasRecentPayment && customer.totalPaid > 0;
      })
      .sort((a, b) => b.totalPaid - a.totalPaid);

    return {
      customers: bestPayingCustomers,
      count: bestPayingCustomers.length,
      totalPaid: bestPayingCustomers.reduce((sum, c) => sum + c.totalPaid, 0)
    };
  });

// Get highest debt customers yearly
export const getHighestDebtCustomersYearlyRoute = publicProcedure
  .input(z.object({
    year: z.number().optional().default(new Date().getFullYear())
  }))
  .query(({ input }) => {
    const yearlyHighDebtCustomers = mockCustomers
      .filter(customer => {
        const createdYear = new Date(customer.createdAt).getFullYear();
        return createdYear <= input.year && customer.totalDebt > 0;
      })
      .sort((a, b) => (b.totalDebt - b.totalPaid) - (a.totalDebt - a.totalPaid));

    return {
      customers: yearlyHighDebtCustomers,
      count: yearlyHighDebtCustomers.length,
      totalDebt: yearlyHighDebtCustomers.reduce((sum, c) => sum + (c.totalDebt - c.totalPaid), 0),
      year: input.year
    };
  });

// Get best paying customers yearly (218)
export const getBestPayingCustomersYearlyRoute = publicProcedure
  .input(z.object({
    year: z.number().optional().default(new Date().getFullYear())
  }))
  .query(({ input }) => {
    const yearlyBestPayers = mockCustomers
      .filter(customer => {
        const createdYear = new Date(customer.createdAt).getFullYear();
        return createdYear <= input.year && customer.totalPaid > 0;
      })
      .sort((a, b) => b.totalPaid - a.totalPaid);

    return {
      customers: yearlyBestPayers,
      count: yearlyBestPayers.length,
      totalPaid: yearlyBestPayers.reduce((sum, c) => sum + c.totalPaid, 0),
      year: input.year
    };
  });

// Get customers by group (219)
export const getCustomersByGroupRoute = publicProcedure
  .query(() => {
    const groupedCustomers = mockCustomers.reduce((groups, customer) => {
      const group = customer.group || 'بێ گرووپ';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(customer);
      return groups;
    }, {} as Record<string, typeof mockCustomers>);

    const groupStats = Object.entries(groupedCustomers).map(([groupName, customers]) => ({
      groupName,
      customers,
      count: customers.length,
      totalDebt: customers.reduce((sum, c) => sum + (c.totalDebt - c.totalPaid), 0),
      totalPaid: customers.reduce((sum, c) => sum + c.totalPaid, 0),
      averageRating: customers.reduce((sum, c) => sum + (c.rating || 0), 0) / customers.length
    }));

    return {
      groups: groupStats,
      totalGroups: groupStats.length
    };
  });

// Customer activity log (220)
interface CustomerActivity {
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

// Mock activity data
const mockActivities: CustomerActivity[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'ئەحمەد محەمەد',
    type: 'debt_added',
    description: 'زیادکردنی قەرزی نوێ',
    amount: 50000,
    timestamp: '2024-12-29T10:30:00Z',
    employeeId: 'emp1',
    employeeName: 'کارمەند یەک',
    metadata: { category: 'خواردن' }
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'فاتیمە ئەحمەد',
    type: 'payment_made',
    description: 'پارەدانی بەشێک لە قەرز',
    amount: 25000,
    timestamp: '2024-12-29T09:15:00Z',
    employeeId: 'emp2',
    employeeName: 'کارمەند دوو'
  },
  {
    id: '3',
    customerId: '1',
    customerName: 'ئەحمەد محەمەد',
    type: 'profile_viewed',
    description: 'بینینی زانیاری کڕیار',
    timestamp: '2024-12-29T08:45:00Z',
    employeeId: 'emp1',
    employeeName: 'کارمەند یەک'
  },
  {
    id: '4',
    customerId: '3',
    customerName: 'محەمەد ئەلی',
    type: 'profile_updated',
    description: 'نوێکردنەوەی زانیاری کڕیار',
    timestamp: '2024-12-28T16:20:00Z',
    employeeId: 'admin',
    employeeName: 'بەڕێوەبەر'
  },
  {
    id: '5',
    customerId: '4',
    customerName: 'زەینەب حەسەن',
    type: 'note_added',
    description: 'زیادکردنی تێبینی نوێ',
    timestamp: '2024-12-28T14:10:00Z',
    employeeId: 'emp1',
    employeeName: 'کارمەند یەک',
    metadata: { note: 'کڕیاری زۆر باش و متمانەپێکراو' }
  }
];

export const getCustomerActivityLogRoute = publicProcedure
  .input(z.object({
    customerId: z.string().optional(),
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    type: z.enum(['debt_added', 'payment_made', 'profile_viewed', 'profile_updated', 'note_added']).optional()
  }))
  .query(({ input }) => {
    let filteredActivities = mockActivities;

    // Filter by customer ID if provided
    if (input.customerId) {
      filteredActivities = filteredActivities.filter(activity => 
        activity.customerId === input.customerId
      );
    }

    // Filter by activity type if provided
    if (input.type) {
      filteredActivities = filteredActivities.filter(activity => 
        activity.type === input.type
      );
    }

    // Sort by timestamp (newest first)
    filteredActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const paginatedActivities = filteredActivities.slice(
      input.offset, 
      input.offset + input.limit
    );

    return {
      activities: paginatedActivities,
      totalCount: filteredActivities.length,
      hasMore: input.offset + input.limit < filteredActivities.length,
      summary: {
        totalDebtAdded: filteredActivities
          .filter(a => a.type === 'debt_added')
          .reduce((sum, a) => sum + (a.amount || 0), 0),
        totalPaymentsMade: filteredActivities
          .filter(a => a.type === 'payment_made')
          .reduce((sum, a) => sum + (a.amount || 0), 0),
        profileViews: filteredActivities.filter(a => a.type === 'profile_viewed').length,
        profileUpdates: filteredActivities.filter(a => a.type === 'profile_updated').length
      }
    };
  });

// Get customer statistics
export const getCustomerStatsRoute = publicProcedure
  .query(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const stats: CustomerStats = {
      totalCustomers: mockCustomers.length,
      activeCustomers: mockCustomers.filter(c => c.status === 'active').length,
      inactiveCustomers: mockCustomers.filter(c => c.status === 'inactive').length,
      newThisMonth: mockCustomers.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate.getMonth() === currentMonth && 
               createdDate.getFullYear() === currentYear;
      }).length,
      totalDebtAmount: mockCustomers.reduce((sum, c) => sum + c.totalDebt, 0),
      totalPaidAmount: mockCustomers.reduce((sum, c) => sum + c.totalPaid, 0),
      averageDebtPerCustomer: mockCustomers.length > 0 ? 
        mockCustomers.reduce((sum, c) => sum + (c.totalDebt - c.totalPaid), 0) / mockCustomers.length : 0
    };

    return stats;
  });