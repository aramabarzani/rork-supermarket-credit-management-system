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
import {
  runSystemValidationProcedure,
  validateDebtsProcedure,
  validatePaymentsProcedure,
  validateCustomersProcedure,
  validateEmployeesProcedure,
  validateAuthProcedure,
  validateBackupProcedure,
  validateSettingsProcedure,
  validateReportsProcedure,
  getValidationStatsProcedure,
  getAutoValidationSettingsProcedure,
  updateAutoValidationSettingsProcedure,
  exportValidationReportProcedure
} from "./routes/validation/system/route";
import {
  exportToExcelProcedure,
  exportToPDFProcedure,
  exportDashboardProcedure,
  exportChartProcedure
} from "./routes/integration/export/route";
import {
  syncToGoogleDriveProcedure,
  syncToDropboxProcedure,
  syncToOneDriveProcedure,
  syncToGoogleSheetsProcedure,
  getCloudSyncSettingsProcedure,
  updateCloudSyncSettingsProcedure
} from "./routes/integration/cloud/route";
import {
  shareViaEmailProcedure,
  shareViaWhatsAppProcedure,
  shareViaTelegramProcedure,
  shareViaSMSProcedure,
  shareReceiptProcedure,
  shareReportProcedure,
  scheduledShareProcedure
} from "./routes/integration/share/route";
import {
  voiceSearchProcedure,
  advancedSearchProcedure,
  quickSearchProcedure,
  autoEmailSearchProcedure
} from "./routes/voice/search/route";
import {
  debtReportByPeriodProcedure,
  paymentReportByPeriodProcedure,
  customerReportByLevelProcedure,
  employeeReportByLevelProcedure,
  inactiveCustomersReportProcedure,
  inactiveEmployeesReportProcedure,
  debtReportByCityProcedure,
  paymentReportByCityProcedure,
  debtReportByLocationProcedure,
  paymentReportByLocationProcedure,
  vipCustomersReportProcedure,
  allDebtsByDateProcedure,
  allPaymentsByDateProcedure
} from "./routes/financial/advanced-reports/route";
import {
  getFormsProcedure,
  getFormByIdProcedure,
  createFormProcedure,
  updateFormProcedure,
  deleteFormProcedure,
  addFieldProcedure,
  removeFieldProcedure,
  updateFieldProcedure,
  submitFormProcedure,
  getSubmissionsProcedure,
  getFormAnalyticsProcedure,
  exportFormDataProcedure
} from "./routes/forms/management/route";
import {
  getErrorLogsProcedure,
  getErrorStatsProcedure,
  reportErrorProcedure,
  resolveErrorProcedure,
  deleteErrorProcedure,
  generateErrorReportProcedure,
  sendErrorReportProcedure
} from "./routes/errors/management/route";
import {
  getActiveUsersProcedure,
  getRecentActivitiesProcedure,
  getLoginRecordsProcedure,
  getLoginStatisticsProcedure,
  getRealtimeStatsProcedure,
  trackUserActivityProcedure,
  updateUserLastActivityProcedure
} from "./routes/monitoring/activity/route";
import {
  getBackupRecordsProcedure,
  getBackupSettingsProcedure,
  updateBackupSettingsProcedure,
  createManualBackupProcedure,
  deleteBackupProcedure,
  restoreBackupProcedure
} from "./routes/monitoring/backup/route";
import {
  getInactivityAlertsProcedure,
  getInactivitySettingsProcedure,
  updateInactivitySettingsProcedure,
  checkInactiveUsersProcedure,
  sendInactivityAlertProcedure,
  resolveInactivityAlertProcedure,
  getInactivityReportProcedure
} from "./routes/monitoring/inactivity/route";
import {
  getCustomReportsProcedure,
  getCustomReportByIdProcedure,
  generateAdminReportProcedure,
  generateEmployeeReportProcedure,
  generateCustomerReportProcedure,
  deleteCustomReportProcedure
} from "./routes/monitoring/reports/route";
import {
  getBackupConfigProcedure,
  updateBackupConfigProcedure,
  getBackupRecordsProcedure as getBackupRecordsNewProcedure,
  createBackupProcedure,
  getBackupStatsProcedure,
  restoreBackupProcedure as restoreBackupNewProcedure,
  generateBackupReportProcedure,
  verifyBackupProcedure,
  deleteBackupProcedure as deleteBackupNewProcedure
} from "./routes/backup/management/route";
import {
  debtEvaluationProcedure,
  paymentEvaluationProcedure,
  customerEvaluationProcedure,
  employeeEvaluationProcedure,
  systemStatisticsProcedure
} from "./routes/analytics/evaluation/route";
import {
  debtTrendProcedure,
  paymentTrendProcedure,
  comparisonDataProcedure,
  customerStatsByRatingProcedure,
  employeeStatsByLevelProcedure,
  locationStatsProcedure
} from "./routes/analytics/trends/route";
import {
  systemUsageProcedure,
  realtimeStatsProcedure
} from "./routes/analytics/usage/route";
import {
  checkUpdatesProcedure,
  getUpdatesProcedure,
  getUpdateSettingsProcedure,
  updateSettingsProcedure,
  downloadUpdateProcedure,
  installUpdateProcedure
} from "./routes/system/updates/route";
import {
  getQuickReportsProcedure,
  generateQuickReportProcedure,
  getReportTemplatesProcedure,
  createReportTemplateProcedure,
  exportReportProcedure as exportQuickReportProcedure,
  emailReportProcedure
} from "./routes/reports/quick/route";
import {
  getNotesProcedure,
  createNoteProcedure,
  updateNoteProcedure,
  deleteNoteProcedure,
  getNoteStatsProcedure,
  exportNotesProcedure,
  shareNotesProcedure
} from "./routes/notes/management/route";
import {
  getProfileChangesProcedure,
  logProfileChangeProcedure,
  uploadProfileImageProcedure,
  getProfileImagesProcedure,
  getProfileStatsProcedure,
  exportProfileChangesProcedure
} from "./routes/profile/tracking/route";
import {
  getIPRecordsProcedure,
  trackIPProcedure,
  trustIPProcedure,
  blockIPProcedure,
  getIPAlertsProcedure,
  resolveIPAlertProcedure,
  getIPStatsProcedure,
  getIPSecurityReportProcedure,
  exportIPReportProcedure,
  getIPChartDataProcedure
} from "./routes/security/ip-tracking/route";
import {
  getEmployeeImpactProcedure,
  getAdminImpactProcedure,
  getCustomerImpactProcedure,
  getImpactStatisticsProcedure,
  getImpactChartProcedure,
  getImpactFilteredProcedure,
  generateImpactReportProcedure,
  exportImpactReportProcedure,
  shareImpactReportProcedure,
  checkPoorPerformanceProcedure
} from "./routes/monitoring/impact/route";

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
    advancedReports: createTRPCRouter({
      debtByPeriod: debtReportByPeriodProcedure,
      paymentByPeriod: paymentReportByPeriodProcedure,
      customerByLevel: customerReportByLevelProcedure,
      employeeByLevel: employeeReportByLevelProcedure,
      inactiveCustomers: inactiveCustomersReportProcedure,
      inactiveEmployees: inactiveEmployeesReportProcedure,
      debtByCity: debtReportByCityProcedure,
      paymentByCity: paymentReportByCityProcedure,
      debtByLocation: debtReportByLocationProcedure,
      paymentByLocation: paymentReportByLocationProcedure,
      vipCustomers: vipCustomersReportProcedure,
      allDebtsByDate: allDebtsByDateProcedure,
      allPaymentsByDate: allPaymentsByDateProcedure,
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
  validation: createTRPCRouter({
    runSystemValidation: runSystemValidationProcedure,
    validateDebts: validateDebtsProcedure,
    validatePayments: validatePaymentsProcedure,
    validateCustomers: validateCustomersProcedure,
    validateEmployees: validateEmployeesProcedure,
    validateAuth: validateAuthProcedure,
    validateBackup: validateBackupProcedure,
    validateSettings: validateSettingsProcedure,
    validateReports: validateReportsProcedure,
    getStats: getValidationStatsProcedure,
    getAutoSettings: getAutoValidationSettingsProcedure,
    updateAutoSettings: updateAutoValidationSettingsProcedure,
    exportReport: exportValidationReportProcedure,
  }),
  integration: createTRPCRouter({
    export: createTRPCRouter({
      toExcel: exportToExcelProcedure,
      toPDF: exportToPDFProcedure,
      dashboard: exportDashboardProcedure,
      chart: exportChartProcedure,
    }),
    cloud: createTRPCRouter({
      syncToGoogleDrive: syncToGoogleDriveProcedure,
      syncToDropbox: syncToDropboxProcedure,
      syncToOneDrive: syncToOneDriveProcedure,
      syncToGoogleSheets: syncToGoogleSheetsProcedure,
      getSettings: getCloudSyncSettingsProcedure,
      updateSettings: updateCloudSyncSettingsProcedure,
    }),
    share: createTRPCRouter({
      viaEmail: shareViaEmailProcedure,
      viaWhatsApp: shareViaWhatsAppProcedure,
      viaTelegram: shareViaTelegramProcedure,
      viaSMS: shareViaSMSProcedure,
      receipt: shareReceiptProcedure,
      report: shareReportProcedure,
      scheduled: scheduledShareProcedure,
    }),
  }),
  voice: createTRPCRouter({
    search: voiceSearchProcedure,
  }),
  search: createTRPCRouter({
    advanced: advancedSearchProcedure,
    quick: quickSearchProcedure,
    autoEmail: autoEmailSearchProcedure,
  }),
  forms: createTRPCRouter({
    getAll: getFormsProcedure,
    getById: getFormByIdProcedure,
    create: createFormProcedure,
    update: updateFormProcedure,
    delete: deleteFormProcedure,
    addField: addFieldProcedure,
    removeField: removeFieldProcedure,
    updateField: updateFieldProcedure,
    submit: submitFormProcedure,
    getSubmissions: getSubmissionsProcedure,
    getAnalytics: getFormAnalyticsProcedure,
    export: exportFormDataProcedure,
  }),
  errors: createTRPCRouter({
    getLogs: getErrorLogsProcedure,
    getStats: getErrorStatsProcedure,
    report: reportErrorProcedure,
    resolve: resolveErrorProcedure,
    delete: deleteErrorProcedure,
    generateReport: generateErrorReportProcedure,
    sendReport: sendErrorReportProcedure,
  }),
  monitoring: createTRPCRouter({
    activity: createTRPCRouter({
      getActiveUsers: getActiveUsersProcedure,
      getRecentActivities: getRecentActivitiesProcedure,
      getLoginRecords: getLoginRecordsProcedure,
      getLoginStatistics: getLoginStatisticsProcedure,
      getRealtimeStats: getRealtimeStatsProcedure,
      trackActivity: trackUserActivityProcedure,
      updateLastActivity: updateUserLastActivityProcedure,
    }),
    backup: createTRPCRouter({
      getRecords: getBackupRecordsProcedure,
      getSettings: getBackupSettingsProcedure,
      updateSettings: updateBackupSettingsProcedure,
      createManual: createManualBackupProcedure,
      delete: deleteBackupProcedure,
      restore: restoreBackupProcedure,
    }),
    inactivity: createTRPCRouter({
      getAlerts: getInactivityAlertsProcedure,
      getSettings: getInactivitySettingsProcedure,
      updateSettings: updateInactivitySettingsProcedure,
      checkInactive: checkInactiveUsersProcedure,
      sendAlert: sendInactivityAlertProcedure,
      resolveAlert: resolveInactivityAlertProcedure,
      getReport: getInactivityReportProcedure,
    }),
    reports: createTRPCRouter({
      getAll: getCustomReportsProcedure,
      getById: getCustomReportByIdProcedure,
      generateAdmin: generateAdminReportProcedure,
      generateEmployee: generateEmployeeReportProcedure,
      generateCustomer: generateCustomerReportProcedure,
      delete: deleteCustomReportProcedure,
    }),
    impact: createTRPCRouter({
      getEmployeeImpact: getEmployeeImpactProcedure,
      getAdminImpact: getAdminImpactProcedure,
      getCustomerImpact: getCustomerImpactProcedure,
      getStatistics: getImpactStatisticsProcedure,
      getChart: getImpactChartProcedure,
      getFiltered: getImpactFilteredProcedure,
      generateReport: generateImpactReportProcedure,
      exportReport: exportImpactReportProcedure,
      shareReport: shareImpactReportProcedure,
      checkPoorPerformance: checkPoorPerformanceProcedure,
    }),
  }),
  backup: createTRPCRouter({
    getConfig: getBackupConfigProcedure,
    updateConfig: updateBackupConfigProcedure,
    getRecords: getBackupRecordsNewProcedure,
    create: createBackupProcedure,
    getStats: getBackupStatsProcedure,
    restore: restoreBackupNewProcedure,
    generateReport: generateBackupReportProcedure,
    verify: verifyBackupProcedure,
    delete: deleteBackupNewProcedure,
  }),
  analytics: createTRPCRouter({
    evaluation: createTRPCRouter({
      debt: debtEvaluationProcedure,
      payment: paymentEvaluationProcedure,
      customer: customerEvaluationProcedure,
      employee: employeeEvaluationProcedure,
      systemStats: systemStatisticsProcedure,
    }),
    trends: createTRPCRouter({
      debt: debtTrendProcedure,
      payment: paymentTrendProcedure,
      comparison: comparisonDataProcedure,
      customersByRating: customerStatsByRatingProcedure,
      employeesByLevel: employeeStatsByLevelProcedure,
      byLocation: locationStatsProcedure,
    }),
    usage: createTRPCRouter({
      system: systemUsageProcedure,
      realtime: realtimeStatsProcedure,
    }),
  }),
  system: createTRPCRouter({
    updates: createTRPCRouter({
      check: checkUpdatesProcedure,
      getAll: getUpdatesProcedure,
      getSettings: getUpdateSettingsProcedure,
      updateSettings: updateSettingsProcedure,
      download: downloadUpdateProcedure,
      install: installUpdateProcedure,
    }),
  }),
  quickReports: createTRPCRouter({
    getAll: getQuickReportsProcedure,
    generate: generateQuickReportProcedure,
    getTemplates: getReportTemplatesProcedure,
    createTemplate: createReportTemplateProcedure,
    export: exportQuickReportProcedure,
    email: emailReportProcedure,
  }),
  notes: createTRPCRouter({
    getAll: getNotesProcedure,
    create: createNoteProcedure,
    update: updateNoteProcedure,
    delete: deleteNoteProcedure,
    getStats: getNoteStatsProcedure,
    export: exportNotesProcedure,
    share: shareNotesProcedure,
  }),
  profile: createTRPCRouter({
    getChanges: getProfileChangesProcedure,
    logChange: logProfileChangeProcedure,
    uploadImage: uploadProfileImageProcedure,
    getImages: getProfileImagesProcedure,
    getStats: getProfileStatsProcedure,
    exportChanges: exportProfileChangesProcedure,
  }),
  security: createTRPCRouter({
    ip: createTRPCRouter({
      getRecords: getIPRecordsProcedure,
      track: trackIPProcedure,
      trust: trustIPProcedure,
      block: blockIPProcedure,
      getAlerts: getIPAlertsProcedure,
      resolveAlert: resolveIPAlertProcedure,
      getStats: getIPStatsProcedure,
      getSecurityReport: getIPSecurityReportProcedure,
      exportReport: exportIPReportProcedure,
      getChartData: getIPChartDataProcedure,
    }),
  }),
});

export type AppRouter = typeof appRouter;