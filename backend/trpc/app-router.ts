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
import {
  sendSMSProcedure,
  sendBulkSMSProcedure,
  getSMSStatsProcedure
} from "./routes/notifications/sms/route";
import {
  sendEmailProcedure,
  sendBulkEmailProcedure,
  sendReceiptEmailProcedure,
  getEmailStatsProcedure
} from "./routes/notifications/email/route";
import {
  sendWhatsAppProcedure,
  sendViberProcedure,
  sendReceiptWhatsAppProcedure,
  sendBulkWhatsAppProcedure,
  getMessagingStatsProcedure
} from "./routes/notifications/messaging/route";
import {
  sendDirectMessageProcedure,
  getMessageThreadsProcedure,
  getThreadMessagesProcedure,
  markMessageAsReadProcedure,
  markThreadAsReadProcedure
} from "./routes/notifications/messaging/direct-messages";
import {
  triggerDebtNotificationProcedure,
  triggerPaymentNotificationProcedure,
  triggerHighDebtWarningProcedure,
  triggerManagerNotificationProcedure,
  getAutomationSettingsProcedure,
  updateAutomationSettingsProcedure
} from "./routes/notifications/automation/route";
import {
  createIssueProcedure,
  getIssuesProcedure,
  getIssueProcedure,
  updateIssueProcedure,
  rateIssueProcedure,
  addCommentProcedure,
  getCommentsProcedure,
  getIssueStatsProcedure,
  getMonthlyIssueReportProcedure,
  getYearlyIssueReportProcedure
} from "./routes/support/issues/route";

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
  notifications: createTRPCRouter({
    sms: createTRPCRouter({
      send: sendSMSProcedure,
      sendBulk: sendBulkSMSProcedure,
      getStats: getSMSStatsProcedure,
    }),
    email: createTRPCRouter({
      send: sendEmailProcedure,
      sendBulk: sendBulkEmailProcedure,
      sendReceipt: sendReceiptEmailProcedure,
      getStats: getEmailStatsProcedure,
    }),
    messaging: createTRPCRouter({
      sendWhatsApp: sendWhatsAppProcedure,
      sendViber: sendViberProcedure,
      sendReceiptWhatsApp: sendReceiptWhatsAppProcedure,
      sendBulkWhatsApp: sendBulkWhatsAppProcedure,
      getStats: getMessagingStatsProcedure,
      sendDirectMessage: sendDirectMessageProcedure,
      getThreads: getMessageThreadsProcedure,
      getThreadMessages: getThreadMessagesProcedure,
      markMessageAsRead: markMessageAsReadProcedure,
      markThreadAsRead: markThreadAsReadProcedure,
    }),
    automation: createTRPCRouter({
      triggerDebtNotification: triggerDebtNotificationProcedure,
      triggerPaymentNotification: triggerPaymentNotificationProcedure,
      triggerHighDebtWarning: triggerHighDebtWarningProcedure,
      triggerManagerNotification: triggerManagerNotificationProcedure,
      getSettings: getAutomationSettingsProcedure,
      updateSettings: updateAutomationSettingsProcedure,
    }),
  }),
  support: createTRPCRouter({
    issues: createTRPCRouter({
      create: createIssueProcedure,
      getAll: getIssuesProcedure,
      getOne: getIssueProcedure,
      update: updateIssueProcedure,
      rate: rateIssueProcedure,
      addComment: addCommentProcedure,
      getComments: getCommentsProcedure,
      getStats: getIssueStatsProcedure,
      getMonthlyReport: getMonthlyIssueReportProcedure,
      getYearlyReport: getYearlyIssueReportProcedure,
    }),
  }),
});

export type AppRouter = typeof appRouter;