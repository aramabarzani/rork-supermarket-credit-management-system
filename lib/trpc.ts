import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  console.log('[tRPC] Environment check:', {
    EXPO_PUBLIC_RORK_API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL,
    EXPO_PUBLIC_TOOLKIT_URL: process.env.EXPO_PUBLIC_TOOLKIT_URL,
    platform: Platform.OS,
  });

  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('[tRPC] Using EXPO_PUBLIC_RORK_API_BASE_URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (process.env.EXPO_PUBLIC_TOOLKIT_URL) {
    console.log('[tRPC] Using EXPO_PUBLIC_TOOLKIT_URL:', process.env.EXPO_PUBLIC_TOOLKIT_URL);
    return process.env.EXPO_PUBLIC_TOOLKIT_URL;
  }

  if (Platform.OS === 'web') {
    const webUrl = typeof window !== 'undefined' ? window.location.origin : '';
    console.log('[tRPC] Using web origin:', webUrl);
    return webUrl;
  }

  const devUrl = Constants.expoConfig?.hostUri 
    ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:8081`
    : 'http://localhost:8081';
  
  console.log('[tRPC] Using development URL:', devUrl);
  return devUrl;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const token = await AsyncStorage.getItem("authToken");
        console.log('[tRPC] Request headers:', {
          hasToken: !!token,
          url: `${getBaseUrl()}/api/trpc`,
        });
        return {
          authorization: token ? `Bearer ${token}` : "",
        };
      },
      fetch(url, options) {
        console.log('[tRPC] Fetch request:', { url, method: options?.method });
        return fetch(url, options).then(res => {
          console.log('[tRPC] Fetch response:', { status: res.status, ok: res.ok });
          return res;
        }).catch(err => {
          console.error('[tRPC] Fetch error:', err);
          throw err;
        });
      },
    }),
  ],
});

export function isTRPCNetworkError(error: unknown): boolean {
  return false;
}

export function getTRPCErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'هەڵەیەکی نەزانراو ڕوویدا';
}
