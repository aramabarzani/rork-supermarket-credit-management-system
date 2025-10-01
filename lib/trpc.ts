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

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcUrl,
      transformer: superjson,
      fetch: async (url, options) => {
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
          
          const fetchOptions = {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              ...options?.headers,
            },
            signal: options?.signal,
          };

          console.log('[tRPC] Making request to:', url);
          
          const response = await fetch(url, fetchOptions);
          
          console.log('[tRPC] Response status:', response.status);
          
          if (!response.ok) {
            const text = await response.text();
            console.error('[tRPC] HTTP Error:', response.status, text);
            throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.error('[tRPC] Request failed:', error);
          if (error instanceof Error) {
            console.error('[tRPC] Error details:', {
              message: error.message,
              name: error.name,
              stack: error.stack,
            });
            
            if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
              console.error('[tRPC] Network error - Backend may not be running or CORS issue');
              throw new Error('نەتوانرا پەیوەندی بە سێرڤەر بکرێت. تکایە پشکنینی هێڵی ئینتەرنێت بکە یان ئەپەکە دووبارە بکەرەوە.');
            }
          }
          throw error;
        }
      },
    }),
  ],
});