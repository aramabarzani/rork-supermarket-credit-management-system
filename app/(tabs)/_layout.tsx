import { Tabs } from "expo-router";
import { Home, Users, FileText, Settings, Search } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useAuth } from "@/hooks/auth-context";
import { COLORS, SHADOWS } from "@/constants/design-system";

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
        tabBarInactiveTintColor: COLORS.gray[500],
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.neutral.white,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 12,
          ...SHADOWS.xl,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
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