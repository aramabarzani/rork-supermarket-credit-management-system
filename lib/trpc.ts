import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
    console.log('[tRPC] Using EXPO_PUBLIC_RORK_API_BASE_URL:', url);
    return url;
  }

  if (typeof window !== 'undefined') {
    const url = window.location.origin;
    console.log('[tRPC] Using window.location.origin:', url);
    return url;
  }

  const fallback = 'http://localhost:8081';
  console.log('[tRPC] Using fallback:', fallback);
  return fallback;
};

const baseUrl = getBaseUrl();
const trpcUrl = `${baseUrl}/api/trpc`;

console.log('[tRPC] Initialized with base URL:', baseUrl);
console.log('[tRPC] Full tRPC endpoint:', trpcUrl);

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcUrl,
      transformer: superjson,
      fetch: async (url, options) => {
        let token: string | null = null;
        
        try {
          if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
              const userStr = window.localStorage.getItem('user');
              if (userStr) {
                const user = JSON.parse(userStr);
                token = user.id || 'demo-token';
              }
            }
          } else {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              token = user.id || 'demo-token';
            }
          }
        } catch (storageError) {
          console.warn('[tRPC] Could not retrieve auth token:', storageError);
        }
        
        if (!token) {
          token = 'demo-token';
        }
        
        const fetchOptions = {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options?.headers,
          },
          signal: options?.signal,
        };

        console.log('[tRPC] Request:', url);
        
        try {
          const response = await fetch(url, fetchOptions);
          console.log('[tRPC] Response status:', response.status);
          
          if (!response.ok) {
            const text = await response.text();
            console.error('[tRPC] HTTP Error:', response.status, text);
            throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.error('[tRPC] Fetch error:', error);
          
          if (error instanceof Error && 
              (error.message.includes('Network request failed') || 
               error.message.includes('Failed to fetch') ||
               error.message.includes('fetch failed'))) {
            console.error('[tRPC] Network error - Backend may not be accessible');
            console.error('[tRPC] Attempted URL:', url);
            console.error('[tRPC] Base URL:', baseUrl);
          }
          
          throw error;
        }
      },
    }),
  ],
});