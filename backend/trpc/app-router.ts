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
  getCustomReportsProcedure as getMonitoringReportsProcedure,
  getCustomReportByIdProcedure,
  generateAdminReportProcedure,
  generateEmployeeReportProcedure,
  generateCustomerReportProcedure,
  deleteCustomReportProcedure as deleteMonitoringReportProcedure
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
  enable2FAProcedure,
  disable2FAProcedure,
  verify2FACodeProcedure,
  getSecurityAlertsProcedure,
  resolveSecurityAlertProcedure,
  getDigitalSignaturesProcedure,
  verifyDigitalSignatureProcedure,
  generateSecurityReportProcedure,
  getPasswordPolicyProcedure,
  updatePasswordPolicyProcedure,
  getIpWhitelistProcedure,
  addIpToWhitelistProcedure,
  removeIpFromWhitelistProcedure,
  checkPasswordStrengthProcedure
} from "./routes/security/enhanced/route";
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
import {
  shareReportViaEmailProcedure,
  shareReportViaWhatsAppProcedure,
  shareReportViaTelegramProcedure,
  shareReportViaViberProcedure,
  shareBackupViaEmailProcedure,
  shareBackupViaWhatsAppProcedure,
  shareBackupViaTelegramProcedure,
  shareBackupViaViberProcedure,
  downloadReportPDFProcedure,
  downloadReportExcelProcedure,
  downloadDebtRecordsPDFProcedure,
  downloadDebtRecordsExcelProcedure,
  downloadPaymentRecordsPDFProcedure,
  downloadPaymentRecordsExcelProcedure,
  downloadCustomerRecordsPDFProcedure,
  downloadCustomerRecordsExcelProcedure,
  downloadEmployeeRecordsPDFProcedure,
  downloadEmployeeRecordsExcelProcedure,
  downloadMonthlyReportProcedure,
  downloadYearlyReportProcedure,
  getShareHistoryProcedure,
  getScheduledSharesProcedure,
  createScheduledShareProcedure,
  updateScheduledShareProcedure,
  deleteScheduledShareProcedure,
  getShareStatsProcedure,
  getAutoShareSettingsProcedure,
  updateAutoShareSettingsProcedure
} from "./routes/sharing/management/route";
import {
  tutorialsProcedure,
  tutorialByIdProcedure,
  createTutorialProcedure,
  updateTutorialProcedure,
  deleteTutorialProcedure
} from "./routes/guidance/tutorials/route";
import {
  newslettersProcedure,
  createNewsletterProcedure,
  sendNewsletterProcedure,
  deleteNewsletterProcedure
} from "./routes/guidance/newsletters/route";
import {
  helpMessagesProcedure,
  createHelpMessageProcedure,
  deleteHelpMessageProcedure
} from "./routes/guidance/help-messages/route";
import {
  getSystemConfigProcedure,
  updateSystemConfigProcedure,
  getPasswordPolicyProcedure as getSystemPasswordPolicyProcedure,
  updatePasswordPolicyProcedure as updateSystemPasswordPolicyProcedure,
  getNotificationSettingsProcedure,
  updateNotificationSettingsProcedure,
  getBackupSettingsProcedure as getSystemBackupSettingsProcedure,
  updateBackupSettingsProcedure as updateSystemBackupSettingsProcedure,
  getLimitSettingsProcedure,
  updateLimitSettingsProcedure,
  resetSystemConfigProcedure
} from "./routes/system/config/route";
import {
  globalSearchProcedure,
  quickSearchSuggestionsProcedure
} from "./routes/search/global/route";
import {
  getMessagesProcedure,
  sendMessageProcedure,
  markAsReadProcedure,
  deleteMessageProcedure,
  getMessageStatsProcedure,
  shareMessageProcedure
} from "./routes/messaging/internal/route";
import {
  getConversationsProcedure,
  getChatMessagesProcedure,
  sendChatMessageProcedure,
  createConversationProcedure,
  markChatAsReadProcedure,
  getChatStatsProcedure,
  shareChatProcedure
} from "./routes/messaging/chat/route";
import {
  recordLoginActivityProcedure,
  recordLogoutActivityProcedure,
  getLoginActivitiesProcedure,
  getActivitySessionsProcedure,
  getLocationReportProcedure,
  getLocationSettingsProcedure,
  updateLocationSettingsProcedure,
  getLocationAlertsProcedure,
  resolveLocationAlertProcedure
} from "./routes/location/tracking/route";
import {
  createLicenseProcedure,
  validateLicenseProcedure,
  getAllLicensesProcedure,
  updateLicenseStatusProcedure,
  renewLicenseProcedure,
  activateLicenseProcedure,
  deactivateLicenseProcedure,
  transferLicenseProcedure,
  getLicenseStatsProcedure
} from "./routes/license/management/route";
import {
  getSubscriptionPlansProcedure,
  createSubscriptionProcedure,
  getClientSubscriptionProcedure,
  getAllSubscriptionsProcedure,
  cancelSubscriptionProcedure,
  renewSubscriptionProcedure as renewSubscriptionNewProcedure,
  getSubscriptionPaymentsProcedure
} from "./routes/subscription/management/route";
import {
  getAllRolesProcedure,
  getRoleByIdProcedure,
  createRoleProcedure,
  updateRoleProcedure,
  deleteRoleProcedure,
  assignRoleProcedure,
  revokeRoleProcedure,
  getUserRolesProcedure,
  getUserPermissionsProcedure,
  checkPermissionProcedure,
  getAllPermissionsProcedure,
  getPermissionsByCategoryProcedure
} from "./routes/rbac/management/route";
import {
  createCustomReportProcedure,
  getCustomReportsProcedure,
  generateCustomReportProcedure,
  deleteCustomReportProcedure
} from "./routes/reports/custom/route";
import {
  printReportProcedure,
  printReceiptProcedure,
  printCustomerCardProcedure,
  printEmployeeCardProcedure,
  printManagerCardProcedure,
  getPrintTemplatesProcedure,
  createPrintTemplateProcedure,
  getPrintJobsProcedure
} from "./routes/printing/management/route";
import {
  getIntegrationsProcedure,
  createIntegrationProcedure,
  updateIntegrationProcedure,
  testIntegrationProcedure,
  deleteIntegrationProcedure,
  syncIntegrationProcedure
} from "./routes/integrations/external/route";
import {
  generateYearEndReportProcedure,
  getYearEndReportsProcedure,
  exportYearEndReportProcedure
} from "./routes/reports/year-end/route";
import {
  getSessionControlProcedure,
  updateSessionControlProcedure,
  getLoginAttemptsProcedure,
  unlockAccountProcedure,
  getAccountLockAlertsProcedure
} from "./routes/session/control/route";
import {
  generateComprehensiveReportProcedure,
  getComprehensiveReportsProcedure,
  exportComprehensiveReportProcedure
} from "./routes/system/comprehensive/route";
import {
  createTenantProcedure,
  getAllTenantsProcedure,
  getTenantByIdProcedure,
  getTenantByLicenseProcedure,
  updateTenantStatusProcedure,
  updateTenantSettingsProcedure,
  updateTenantStatsProcedure,
  deleteTenantProcedure,
  getTenantDashboardStatsProcedure,
  extendTenantLicenseProcedure,
  recordTenantAccessProcedure
} from "./routes/tenant/management/route";

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
    global: globalSearchProcedure,
    suggestions: quickSearchSuggestionsProcedure,
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
      getAll: getMonitoringReportsProcedure,
      getById: getCustomReportByIdProcedure,
      generateAdmin: generateAdminReportProcedure,
      generateEmployee: generateEmployeeReportProcedure,
      generateCustomer: generateCustomerReportProcedure,
      delete: deleteMonitoringReportProcedure,
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
    config: createTRPCRouter({
      get: getSystemConfigProcedure,
      update: updateSystemConfigProcedure,
      reset: resetSystemConfigProcedure,
      passwordPolicy: createTRPCRouter({
        get: getSystemPasswordPolicyProcedure,
        update: updateSystemPasswordPolicyProcedure,
      }),
      notifications: createTRPCRouter({
        get: getNotificationSettingsProcedure,
        update: updateNotificationSettingsProcedure,
      }),
      backup: createTRPCRouter({
        get: getSystemBackupSettingsProcedure,
        update: updateSystemBackupSettingsProcedure,
      }),
      limits: createTRPCRouter({
        get: getLimitSettingsProcedure,
        update: updateLimitSettingsProcedure,
      }),
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
    twoFactor: createTRPCRouter({
      enable: enable2FAProcedure,
      disable: disable2FAProcedure,
      verifyCode: verify2FACodeProcedure,
    }),
    alerts: createTRPCRouter({
      getAll: getSecurityAlertsProcedure,
      resolve: resolveSecurityAlertProcedure,
    }),
    signatures: createTRPCRouter({
      getAll: getDigitalSignaturesProcedure,
      verify: verifyDigitalSignatureProcedure,
    }),
    reports: createTRPCRouter({
      generate: generateSecurityReportProcedure,
    }),
    password: createTRPCRouter({
      getPolicy: getPasswordPolicyProcedure,
      updatePolicy: updatePasswordPolicyProcedure,
      checkStrength: checkPasswordStrengthProcedure,
    }),
    ipWhitelist: createTRPCRouter({
      getAll: getIpWhitelistProcedure,
      add: addIpToWhitelistProcedure,
      remove: removeIpFromWhitelistProcedure,
    }),
  }),
  sharing: createTRPCRouter({
    reports: createTRPCRouter({
      shareViaEmail: shareReportViaEmailProcedure,
      shareViaWhatsApp: shareReportViaWhatsAppProcedure,
      shareViaTelegram: shareReportViaTelegramProcedure,
      shareViaViber: shareReportViaViberProcedure,
    }),
    backups: createTRPCRouter({
      shareViaEmail: shareBackupViaEmailProcedure,
      shareViaWhatsApp: shareBackupViaWhatsAppProcedure,
      shareViaTelegram: shareBackupViaTelegramProcedure,
      shareViaViber: shareBackupViaViberProcedure,
    }),
    downloads: createTRPCRouter({
      reportPDF: downloadReportPDFProcedure,
      reportExcel: downloadReportExcelProcedure,
      debtRecordsPDF: downloadDebtRecordsPDFProcedure,
      debtRecordsExcel: downloadDebtRecordsExcelProcedure,
      paymentRecordsPDF: downloadPaymentRecordsPDFProcedure,
      paymentRecordsExcel: downloadPaymentRecordsExcelProcedure,
      customerRecordsPDF: downloadCustomerRecordsPDFProcedure,
      customerRecordsExcel: downloadCustomerRecordsExcelProcedure,
      employeeRecordsPDF: downloadEmployeeRecordsPDFProcedure,
      employeeRecordsExcel: downloadEmployeeRecordsExcelProcedure,
      monthlyReport: downloadMonthlyReportProcedure,
      yearlyReport: downloadYearlyReportProcedure,
    }),
    history: getShareHistoryProcedure,
    scheduled: createTRPCRouter({
      getAll: getScheduledSharesProcedure,
      create: createScheduledShareProcedure,
      update: updateScheduledShareProcedure,
      delete: deleteScheduledShareProcedure,
    }),
    stats: getShareStatsProcedure,
    autoSettings: createTRPCRouter({
      get: getAutoShareSettingsProcedure,
      update: updateAutoShareSettingsProcedure,
    }),
  }),
  guidance: createTRPCRouter({
    tutorials: createTRPCRouter({
      getAll: tutorialsProcedure,
      getById: tutorialByIdProcedure,
      create: createTutorialProcedure,
      update: updateTutorialProcedure,
      delete: deleteTutorialProcedure,
    }),
    newsletters: createTRPCRouter({
      getAll: newslettersProcedure,
      create: createNewsletterProcedure,
      send: sendNewsletterProcedure,
      delete: deleteNewsletterProcedure,
    }),
    helpMessages: createTRPCRouter({
      getAll: helpMessagesProcedure,
      create: createHelpMessageProcedure,
      delete: deleteHelpMessageProcedure,
    }),
  }),
  messaging: createTRPCRouter({
    internal: createTRPCRouter({
      getMessages: getMessagesProcedure,
      send: sendMessageProcedure,
      markAsRead: markAsReadProcedure,
      delete: deleteMessageProcedure,
      getStats: getMessageStatsProcedure,
      share: shareMessageProcedure,
    }),
    chat: createTRPCRouter({
      getConversations: getConversationsProcedure,
      getMessages: getChatMessagesProcedure,
      send: sendChatMessageProcedure,
      createConversation: createConversationProcedure,
      markAsRead: markChatAsReadProcedure,
      getStats: getChatStatsProcedure,
      share: shareChatProcedure,
    }),
  }),
  location: createTRPCRouter({
    tracking: createTRPCRouter({
      recordLogin: recordLoginActivityProcedure,
      recordLogout: recordLogoutActivityProcedure,
      getActivities: getLoginActivitiesProcedure,
      getSessions: getActivitySessionsProcedure,
      getReport: getLocationReportProcedure,
      getSettings: getLocationSettingsProcedure,
      updateSettings: updateLocationSettingsProcedure,
      getAlerts: getLocationAlertsProcedure,
      resolveAlert: resolveLocationAlertProcedure,
    }),
  }),
  license: createTRPCRouter({
    create: createLicenseProcedure,
    validate: validateLicenseProcedure,
    getAll: getAllLicensesProcedure,
    updateStatus: updateLicenseStatusProcedure,
    renew: renewLicenseProcedure,
    activate: activateLicenseProcedure,
    deactivate: deactivateLicenseProcedure,
    transfer: transferLicenseProcedure,
    getStats: getLicenseStatsProcedure,
  }),
  subscription: createTRPCRouter({
    getPlans: getSubscriptionPlansProcedure,
    create: createSubscriptionProcedure,
    getByClient: getClientSubscriptionProcedure,
    getAll: getAllSubscriptionsProcedure,
    cancel: cancelSubscriptionProcedure,
    renew: renewSubscriptionNewProcedure,
    getPayments: getSubscriptionPaymentsProcedure,
  }),
  rbac: createTRPCRouter({
    roles: createTRPCRouter({
      getAll: getAllRolesProcedure,
      getById: getRoleByIdProcedure,
      create: createRoleProcedure,
      update: updateRoleProcedure,
      delete: deleteRoleProcedure,
    }),
    userRoles: createTRPCRouter({
      assign: assignRoleProcedure,
      revoke: revokeRoleProcedure,
      getByUser: getUserRolesProcedure,
    }),
    permissions: createTRPCRouter({
      getAll: getAllPermissionsProcedure,
      getByCategory: getPermissionsByCategoryProcedure,
      getByUser: getUserPermissionsProcedure,
      check: checkPermissionProcedure,
    }),
  }),
  customReports: createTRPCRouter({
    create: createCustomReportProcedure,
    getAll: getCustomReportsProcedure,
    generate: generateCustomReportProcedure,
    delete: deleteCustomReportProcedure,
  }),
  printing: createTRPCRouter({
    printReport: printReportProcedure,
    printReceipt: printReceiptProcedure,
    printCustomerCard: printCustomerCardProcedure,
    printEmployeeCard: printEmployeeCardProcedure,
    printManagerCard: printManagerCardProcedure,
    getTemplates: getPrintTemplatesProcedure,
    createTemplate: createPrintTemplateProcedure,
    getJobs: getPrintJobsProcedure,
  }),
  integrations: createTRPCRouter({
    getAll: getIntegrationsProcedure,
    create: createIntegrationProcedure,
    update: updateIntegrationProcedure,
    test: testIntegrationProcedure,
    delete: deleteIntegrationProcedure,
    sync: syncIntegrationProcedure,
  }),
  yearEndReports: createTRPCRouter({
    generate: generateYearEndReportProcedure,
    getAll: getYearEndReportsProcedure,
    export: exportYearEndReportProcedure,
  }),
  sessionControl: createTRPCRouter({
    getSettings: getSessionControlProcedure,
    updateSettings: updateSessionControlProcedure,
    getLoginAttempts: getLoginAttemptsProcedure,
    unlockAccount: unlockAccountProcedure,
    getAlerts: getAccountLockAlertsProcedure,
  }),
  comprehensiveReports: createTRPCRouter({
    generate: generateComprehensiveReportProcedure,
    getAll: getComprehensiveReportsProcedure,
    export: exportComprehensiveReportProcedure,
  }),
  tenant: createTRPCRouter({
    create: createTenantProcedure,
    getAll: getAllTenantsProcedure,
    getById: getTenantByIdProcedure,
    getByLicense: getTenantByLicenseProcedure,
    updateStatus: updateTenantStatusProcedure,
    updateSettings: updateTenantSettingsProcedure,
    updateStats: updateTenantStatsProcedure,
    delete: deleteTenantProcedure,
    getDashboardStats: getTenantDashboardStatsProcedure,
    extendLicense: extendTenantLicenseProcedure,
    recordAccess: recordTenantAccessProcedure,
  }),
});

export type AppRouter = typeof appRouter;