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
        console.log('[tRPC Request] URL:', url);
        console.log('[tRPC Request] Method:', options?.method || 'GET');
        
        try {
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
          
          console.log('[tRPC Request] Using token:', token ? 'Yes' : 'No');
          
          const response = await fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              ...options?.headers,
            },
          });
          
          console.log('[tRPC Response] Status:', response.status, response.statusText);
          
          if (!response.ok) {
            const text = await response.text();
            console.error('[tRPC Response] Error body:', text);
            throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.error('[tRPC Fetch] Error occurred');
          console.error('[tRPC Fetch] Error type:', error instanceof Error ? error.constructor.name : typeof error);
          console.error('[tRPC Fetch] Error message:', error instanceof Error ? error.message : String(error));
          console.error('[tRPC Fetch] Request URL:', url);
          console.error('[tRPC Fetch] Base URL:', baseUrl);
          console.error('[tRPC Fetch] Full endpoint:', trpcUrl);
          
          if (error instanceof TypeError && error.message.includes('Network request failed')) {
            throw new Error(
              `Cannot connect to backend server at ${baseUrl}. ` +
              `Please ensure the development server is running. ` +
              `Current endpoint: ${trpcUrl}`
            );
          }
          
          throw error;
        }
      },
    }),
  ],
});