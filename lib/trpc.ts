import { createTRPCReact } from "@trpc/react-query";
import { httpLink, TRPCClientError } from "@trpc/client";
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
console.log('[tRPC] ⚠️  Make sure backend server is running: bun run backend/hono.ts');

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
        };
        
        try {
          const response = await fetch(url, fetchOptions);
          
          if (!response.ok) {
            const text = await response.text();
            console.error('[tRPC] HTTP Error:', response.status, text);
            throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
          }
          
          return response;
        } catch (error) {
          if (error instanceof TypeError && (error.message === 'Network request failed' || error.message === 'Failed to fetch')) {
            console.error('[tRPC] ❌ Network error - Backend server is not accessible');
            console.error('[tRPC] Attempted URL:', url);
            console.error('[tRPC] Base URL:', baseUrl);
            console.error('[tRPC] 💡 Solution: Start the backend server with: bun run backend/hono.ts');
          } else {
            console.error('[tRPC] Fetch error:', error);
          }
          throw error;
        }
      },
    }),
  ],
});

export function isTRPCNetworkError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    return error.message.includes('Network request failed') || 
           error.message.includes('Failed to fetch') ||
           error.message.includes('fetch failed');
  }
  return false;
}

export function getTRPCErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    if (isTRPCNetworkError(error)) {
      return 'سێرڤەر بەردەست نییە. تکایە دڵنیابە لەوەی سێرڤەری backend کارپێکراوە.';
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'هەڵەیەکی نەزانراو ڕوویدا';
}