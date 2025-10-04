import { Tabs } from "expo-router";
import { Home, Users, FileText, Settings, Search } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useAuth } from "@/hooks/auth-context";
import { COLORS } from "@/constants/design-system";

export default function TabLayout() {
  const { user, isLoading, isInitialized } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  if (isLoading || !isInitialized) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (user.role === 'customer' || user.role === 'owner') {
    return null;
  }

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary[600],
        tabBarInactiveTintColor: COLORS.gray[400],
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.primary[600],
          ...Platform.select({
            ios: {
              shadowColor: COLORS.primary[900],
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            },
            android: {
              elevation: 5,
            },
          }),
        },
        headerTintColor: COLORS.neutral.white,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: COLORS.neutral.white,
          borderTopWidth: 0,
          ...Platform.select({
            ios: {
              shadowColor: COLORS.gray[900],
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "سەرەکی",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: "کڕیارەکان",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "ڕاپۆرتەکان",
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "گەڕان",
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "ڕێکخستنەکان",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          href: isAdmin ? '/(tabs)/settings' : null,
        }}
      />
    </Tabs>
  );
}