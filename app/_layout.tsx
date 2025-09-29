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
        name="employee-activity" 
        options={{ 
          title: "چالاکیەکانی کارمەند",
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
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SettingsProvider>
          <AuthProvider>
            <SecurityProvider>
              <DebtProvider>
                <ReceiptProvider>
                  <UsersProvider>
                    <NotificationProvider>
                      <RootLayoutNav />
                      <SessionTimeoutWarning />
                    </NotificationProvider>
                  </UsersProvider>
                </ReceiptProvider>
              </DebtProvider>
            </SecurityProvider>
          </AuthProvider>
        </SettingsProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}