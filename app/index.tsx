import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/auth-context';

export default function IndexScreen() {
  const router = useRouter();
  const { user, isLoading, isInitialized } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, Platform.OS === 'web' ? 100 : 50);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading || !isInitialized) {
      console.log('IndexScreen: Still loading...', { isMounted, isLoading, isInitialized });
      return;
    }
    
    console.log('IndexScreen: Auth loaded, user:', !!user);
    
    // Small delay to ensure everything is ready, then navigate
    const timer = setTimeout(() => {
      if (user) {
        console.log('IndexScreen: User found, redirecting to dashboard');
        router.replace('/(tabs)/dashboard');
      } else {
        console.log('IndexScreen: No user, redirecting to login');
        router.replace('/login');
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [router, user, isLoading, isInitialized, isMounted]);

  // Show loading screen while auth is initializing
  if (!isMounted || isLoading || !isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>
            چاوەڕوان بە...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // This should rarely be seen as navigation should happen immediately
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>
          گواستنەوە...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    marginTop: 16,
  },
});