import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import {
  getInactiveCustomersRoute,
  getNewCustomersThisMonthRoute,
  getHighDebtCustomersThisMonthRoute,
  getBestPayingCustomersThisMonthRoute,
  getHighestDebtCustomersYearlyRoute,
  getBestPayingCustomersYearlyRoute,
  getCustomersByGroupRoute,
  getCustomerActivityLogRoute,
  getCustomerStatsRoute
} from "./routes/customers/analytics/route";
import {
  systemBalanceProcedure,
  customerBalanceProcedure,
  employeeBalanceProcedure
} from "./routes/financial/system-balance/route";
import {
  monthlyReportProcedure,
  yearlyReportProcedure,
  irregularPaymentsProcedure,
  topDebtorsProcedure,
  topPayersProcedure,
  exportReportProcedure
} from "./routes/financial/reports/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  customers: createTRPCRouter({
    analytics: createTRPCRouter({
      getInactive: getInactiveCustomersRoute,
      getNewThisMonth: getNewCustomersThisMonthRoute,
      getHighDebtThisMonth: getHighDebtCustomersThisMonthRoute,
      getBestPayingThisMonth: getBestPayingCustomersThisMonthRoute,
      getHighestDebtYearly: getHighestDebtCustomersYearlyRoute,
      getBestPayingYearly: getBestPayingCustomersYearlyRoute,
      getByGroup: getCustomersByGroupRoute,
      getActivityLog: getCustomerActivityLogRoute,
      getStats: getCustomerStatsRoute,
    }),
  }),
  financial: createTRPCRouter({
    balance: createTRPCRouter({
      system: systemBalanceProcedure,
      customer: customerBalanceProcedure,
      employee: employeeBalanceProcedure,
    }),
    reports: createTRPCRouter({
      monthly: monthlyReportProcedure,
      yearly: yearlyReportProcedure,
      irregularPayments: irregularPaymentsProcedure,
      topDebtors: topDebtorsProcedure,
      topPayers: topPayersProcedure,
      export: exportReportProcedure,
    }),
  }),
});

export type AppRouter = typeof appRouter;