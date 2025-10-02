import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StyleSheet, Platform, View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/hooks/auth-context";
import { DebtProvider } from "@/hooks/debt-context";
import { UsersProvider } from "@/hooks/users-context";
import { NotificationProvider } from "@/hooks/notification-context";
import { SettingsProvider } from "@/hooks/settings-context";
import { SecurityProvider } from "@/hooks/security-context";
import { ReceiptProvider } from "@/hooks/receipt-context";
import { CustomerSettingsProvider } from "@/hooks/customer-settings-context";
import { MessagingProvider } from "@/hooks/messaging-context";
import { IntegrationProvider } from "@/hooks/integration-context";
import { AdvancedFiltersProvider } from "@/hooks/advanced-filters-context";
import { CustomFormsProvider } from "@/hooks/custom-forms-context";
import { ErrorLoggingProvider } from "@/hooks/error-logging-context";
import { UICustomizationProvider } from "@/hooks/ui-customization-context";
import { NotesProvider } from "@/hooks/notes-context";
import { ProfileTrackingProvider } from "@/hooks/profile-tracking-context";
import { TenantProvider } from "@/hooks/tenant-context";
import { StoreRequestProvider } from "@/hooks/store-request-context";
import { SupportProvider } from "@/hooks/support-context";

import { GuidanceContext as GuidanceProvider } from "@/hooks/guidance-context";
import { BackupContext as BackupProvider } from "@/hooks/backup-context";
import { SystemConfigContext as SystemConfigProvider } from "@/hooks/system-config-context";
import { UsabilityProvider } from "@/hooks/usability-context";
import { VoiceInputContext as VoiceInputProvider } from "@/hooks/voice-input-context";
import { FAQProvider } from "@/hooks/faq-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";

// Only prevent auto hide on native platforms
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "گەڕانەوە" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="add-debt" 
        options={{ 
          title: "زیادکردنی قەرز",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="add-payment" 
        options={{ 
          title: "تۆمارکردنی پارەدان",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="add-user" 
        options={{ 
          title: "زیادکردنی بەکارهێنەر",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="employees" 
        options={{ 
          title: "بەڕێوەبردنی کارمەندەکان",
        }} 
      />
      <Stack.Screen 
        name="permissions" 
        options={{ 
          title: "بەڕێوەبردنی دەسەڵاتەکان",
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: "پرۆفایلی بەکارهێنەر",
        }} 
      />
      <Stack.Screen 
        name="debt-management" 
        options={{ 
          title: "بەڕێوەبردنی قەرزەکان",
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: "ئاگاداریەکان",
        }} 
      />
      <Stack.Screen 
        name="payments" 
        options={{ 
          title: "پارەدانەکان",
        }} 
      />
      <Stack.Screen 
        name="payment-reports" 
        options={{ 
          title: "ڕاپۆرتی پارەدان",
        }} 
      />
      <Stack.Screen 
        name="customer-reports" 
        options={{ 
          title: "ڕاپۆرتی کڕیارەکان",
        }} 
      />
      <Stack.Screen 
        name="monthly-reports" 
        options={{ 
          title: "ڕاپۆرتی مانگانە",
        }} 
      />
      <Stack.Screen 
        name="balance-report" 
        options={{ 
          title: "ڕاپۆرتی بالانس",
        }} 
      />
      <Stack.Screen 
        name="system-settings" 
        options={{ 
          title: "ڕێکخستنی سیستەم",
        }} 
      />
      <Stack.Screen 
        name="security-management" 
        options={{ 
          title: "بەڕێوەبردنی پاراستن",
        }} 
      />
      <Stack.Screen 
        name="receipts" 
        options={{ 
          title: "وەسڵەکان",
        }} 
      />


      <Stack.Screen 
        name="employee-activity" 
        options={{ 
          title: "چالاکیەکانی کارمەند",
        }} 
      />
      <Stack.Screen 
        name="notification-management" 
        options={{ 
          title: "بەڕێوەبردنی ئاگاداری",
        }} 
      />
      <Stack.Screen 
        name="customer-analytics" 
        options={{ 
          title: "شیکاری کڕیارەکان",
        }} 
      />
      <Stack.Screen 
        name="financial-dashboard" 
        options={{ 
          title: "داشبۆردی دارایی",
        }} 
      />
      <Stack.Screen 
        name="detailed-financial-reports" 
        options={{ 
          title: "ڕاپۆرتی دارایی ورد",
        }} 
      />
      <Stack.Screen 
        name="detailed-customer-reports" 
        options={{ 
          title: "ڕاپۆرتی کڕیار ورد",
        }} 
      />
      <Stack.Screen 
        name="edit-customer" 
        options={{ 
          title: "دەستکاری کڕیار",
        }} 
      />
      <Stack.Screen 
        name="send-notification" 
        options={{ 
          title: "ناردنی ئاگاداری",
        }} 
      />
      <Stack.Screen 
        name="customer-settings" 
        options={{ 
          title: "ڕێکخستنەکانی کڕیار",
        }} 
      />
      <Stack.Screen 
        name="support-issues" 
        options={{ 
          title: "کێشەکان و پشتگیری",
        }} 
      />
      <Stack.Screen 
        name="support-issue-detail" 
        options={{ 
          title: "وردەکاریەکانی کێشە",
        }} 
      />
      <Stack.Screen 
        name="system-validation" 
        options={{ 
          title: "پشکنینی سیستەم",
        }} 
      />
      <Stack.Screen 
        name="integration-settings" 
        options={{ 
          title: "ڕێکخستنی هەموهانگکردن",
        }} 
      />
      <Stack.Screen 
        name="advanced-filters" 
        options={{ 
          title: "فلتەری پێشکەوتوو",
        }} 
      />
      <Stack.Screen 
        name="form-builder" 
        options={{ 
          title: "دروستکردنی فۆرم",
        }} 
      />
      <Stack.Screen 
        name="custom-forms" 
        options={{ 
          title: "فۆرمە تایبەتییەکان",
        }} 
      />
      <Stack.Screen 
        name="error-monitoring" 
        options={{ 
          title: "چاودێری هەڵەکان",
        }} 
      />
      <Stack.Screen 
        name="ui-customization" 
        options={{ 
          title: "دەستکاریکردنی ڕووکار",
        }} 
      />
      <Stack.Screen 
        name="realtime-monitoring" 
        options={{ 
          title: "چاودێری کاتی ڕاستەوخۆ",
        }} 
      />
      <Stack.Screen 
        name="backup-management" 
        options={{ 
          title: "بەڕێوەبردنی باکاپ",
        }} 
      />
      <Stack.Screen 
        name="notes-management" 
        options={{ 
          title: "بەڕێوەبردنی یاداشتەکان",
        }} 
      />
      <Stack.Screen 
        name="profile-tracking" 
        options={{ 
          title: "چاودێری گۆڕانکاریەکانی پرۆفایل",
        }} 
      />
      <Stack.Screen 
        name="ip-security" 
        options={{ 
          title: "پاراستنی IP",
        }} 
      />
      <Stack.Screen 
        name="usability-settings" 
        options={{ 
          title: "ڕێکخستنی بەکارهێنان",
        }} 
      />
      <Stack.Screen 
        name="performance-monitoring" 
        options={{ 
          title: "چاودێری کارایی",
        }} 
      />
      <Stack.Screen 
        name="usage-statistics" 
        options={{ 
          title: "ئاماری بەکارهێنان",
        }} 
      />
      <Stack.Screen 
        name="owner-dashboard" 
        options={{ 
          title: "داشبۆردی خاوەندار",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="subscription-details" 
        options={{ 
          title: "وردەکاریەکانی ئابوونە",
        }} 
      />
      <Stack.Screen 
        name="store-registration" 
        options={{ 
          title: "تۆمارکردنی فرۆشگا",
        }} 
      />
      <Stack.Screen 
        name="store-requests" 
        options={{ 
          title: "داواکاریەکانی فرۆشگا",
        }} 
      />
      <Stack.Screen 
        name="admin-stores" 
        options={{ 
          title: "بەڕێوەبردنی فرۆشگاکان",
        }} 
      />
      <Stack.Screen 
        name="global-search" 
        options={{ 
          title: "گەڕانی گشتی",
        }} 
      />
      <Stack.Screen 
        name="customer-detail/[id]" 
        options={{ 
          title: "وردەکاریەکانی کڕیار",
        }} 
      />
      <Stack.Screen 
        name="edit-employee" 
        options={{ 
          title: "دەستکاری کارمەند",
        }} 
      />
      <Stack.Screen 
        name="employee-permissions" 
        options={{ 
          title: "دەسەڵاتەکانی کارمەند",
        }} 
      />
      <Stack.Screen 
        name="vip-customers-report" 
        options={{ 
          title: "ڕاپۆرتی کڕیارە VIP ەکان",
        }} 
      />
      <Stack.Screen 
        name="advanced-reports" 
        options={{ 
          title: "ڕاپۆرتی پێشکەوتوو",
        }} 
      />
      <Stack.Screen 
        name="location-reports" 
        options={{ 
          title: "ڕاپۆرتی شوێن",
        }} 
      />
      <Stack.Screen 
        name="inactive-users-report" 
        options={{ 
          title: "ڕاپۆرتی بەکارهێنەرە ناچالاکەکان",
        }} 
      />
      <Stack.Screen 
        name="role-management" 
        options={{ 
          title: "بەڕێوەبردنی ڕۆڵەکان",
        }} 
      />
      <Stack.Screen 
        name="admin-management" 
        options={{ 
          title: "بەڕێوەبردنی بەڕێوەبەران",
        }} 
      />
      <Stack.Screen 
        name="permissions-report" 
        options={{ 
          title: "ڕاپۆرتی دەسەڵاتەکان",
        }} 
      />
      <Stack.Screen 
        name="analytics-dashboard" 
        options={{ 
          title: "داشبۆردی شیکاری",
        }} 
      />
      <Stack.Screen 
        name="quick-dashboard" 
        options={{ 
          title: "داشبۆردی خێرا",
        }} 
      />
      <Stack.Screen 
        name="system-updates" 
        options={{ 
          title: "نوێکردنەوەکانی سیستەم",
        }} 
      />
      <Stack.Screen 
        name="impact-analysis" 
        options={{ 
          title: "شیکاری کاریگەری",
        }} 
      />
      <Stack.Screen 
        name="enhanced-security" 
        options={{ 
          title: "پاراستنی پێشکەوتوو",
        }} 
      />
      <Stack.Screen 
        name="security-alerts" 
        options={{ 
          title: "ئاگاداریەکانی پاراستن",
        }} 
      />
      <Stack.Screen 
        name="security-reports" 
        options={{ 
          title: "ڕاپۆرتەکانی پاراستن",
        }} 
      />
      <Stack.Screen 
        name="sharing-management" 
        options={{ 
          title: "بەڕێوەبردنی هاوبەشکردن",
        }} 
      />
      <Stack.Screen 
        name="guidance-management" 
        options={{ 
          title: "بەڕێوەبردنی ڕێنمایی",
        }} 
      />
      <Stack.Screen 
        name="newsletter-management" 
        options={{ 
          title: "بەڕێوەبردنی نامەی هەواڵ",
        }} 
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          title: "دەستپێکردن",
        }} 
      />
      <Stack.Screen 
        name="system-config" 
        options={{ 
          title: "ڕێکخستنی سیستەم",
        }} 
      />
      <Stack.Screen 
        name="internal-messaging" 
        options={{ 
          title: "پەیامی ناوخۆیی",
        }} 
      />
      <Stack.Screen 
        name="tenant-features" 
        options={{ 
          title: "تایبەتمەندیەکانی فرۆشگا",
        }} 
      />
      <Stack.Screen 
        name="customer-qr-management" 
        options={{ 
          title: "بەڕێوەبردنی QR کڕیارەکان",
        }} 
      />
      <Stack.Screen 
        name="scan-customer-qr" 
        options={{ 
          title: "سکان کردنی QR کڕیار",
        }} 
      />
      <Stack.Screen 
        name="customer-dashboard" 
        options={{ 
          title: "داشبۆردی کڕیار",
        }} 
      />
      <Stack.Screen 
        name="debt-categories-management" 
        options={{ 
          title: "بەڕێوەبردنی مۆری قەرز",
        }} 
      />
      <Stack.Screen 
        name="predictive-analytics" 
        options={{ 
          title: "شیکاری پێشبینی",
        }} 
      />
      <Stack.Screen 
        name="customer-map" 
        options={{ 
          title: "نەخشەی کڕیاران",
        }} 
      />
      <Stack.Screen 
        name="whatsapp-sms-integration" 
        options={{ 
          title: "WhatsApp و SMS",
        }} 
      />

    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#1E3A8A',
  },
});



export default function RootLayout() {
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== 'web');

  useEffect(() => {
    console.log('RootLayout mounted');
    
    if (Platform.OS === 'web') {
      // Wait for client-side hydration to complete
      // Use multiple checks to ensure DOM and React are ready
      const checkHydration = () => {
        if (typeof window !== 'undefined' && document.readyState === 'complete') {
          // Additional delay to ensure React hydration is complete
          setTimeout(() => {
            setIsHydrated(true);
          }, 50);
        } else {
          setTimeout(checkHydration, 10);
        }
      };
      
      checkHydration();
    } else {
      // Handle splash screen on native platforms
      const timer = setTimeout(() => {
        console.log('Hiding splash screen');
        SplashScreen.hideAsync();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Show minimal loading screen during hydration
  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        <ErrorLoggingProvider>
          <TenantProvider>
            <AuthProvider>
              <SettingsProvider>
                <SecurityProvider>
                  <DebtProvider>
                    <UsersProvider>
                      <NotificationProvider>
                        <ReceiptProvider>
                          <CustomerSettingsProvider>
                            <MessagingProvider>
                              <IntegrationProvider>
                                <AdvancedFiltersProvider>
                                  <CustomFormsProvider>
                                    <NotesProvider>
                                      <ProfileTrackingProvider>
                                        <UICustomizationProvider>
                                          <GuidanceProvider>
                                            <BackupProvider>
                                              <SystemConfigProvider>
                                                <UsabilityProvider>
                                                  <StoreRequestProvider>
                                                    <SupportProvider>
                                                      <FAQProvider>
                                                        <VoiceInputProvider>
                                                          <RootLayoutNav />
                                                          <SessionTimeoutWarning />
                                                        </VoiceInputProvider>
                                                      </FAQProvider>
                                                    </SupportProvider>
                                                  </StoreRequestProvider>
                                                </UsabilityProvider>
                                              </SystemConfigProvider>
                                            </BackupProvider>
                                          </GuidanceProvider>
                                        </UICustomizationProvider>
                                      </ProfileTrackingProvider>
                                    </NotesProvider>
                                  </CustomFormsProvider>
                                </AdvancedFiltersProvider>
                              </IntegrationProvider>
                            </MessagingProvider>
                          </CustomerSettingsProvider>
                        </ReceiptProvider>
                      </NotificationProvider>
                    </UsersProvider>
                  </DebtProvider>
                </SecurityProvider>
              </SettingsProvider>
            </AuthProvider>
          </TenantProvider>
        </ErrorLoggingProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}