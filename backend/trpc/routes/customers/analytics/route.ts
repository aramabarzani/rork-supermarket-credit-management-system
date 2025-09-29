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