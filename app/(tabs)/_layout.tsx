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
        tabBarInactiveTintColor: COLORS.gray[400],
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTopWidth: 1,
          borderTopColor: COLORS.border.light,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 14,
          paddingTop: 10,
          marginHorizontal: 16,
          marginBottom: Platform.OS === 'ios' ? 20 : 16,
          borderRadius: 24,
          ...SHADOWS['2xl'],
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          letterSpacing: 0.3,
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