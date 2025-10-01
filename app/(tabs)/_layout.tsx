import { Tabs } from "expo-router";
import { Home, Users, FileText, Settings, Search } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/hooks/auth-context";

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
        tabBarActiveTintColor: '#1E3A8A',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1E3A8A',
        },
        headerTintColor: 'white',
        headerTitleAlign: 'center',
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