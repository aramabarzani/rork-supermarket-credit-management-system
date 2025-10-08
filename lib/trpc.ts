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
    manifest: Constants.expoConfig?.extra,
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
    const webUrl = window.location.origin;
    console.log('[tRPC] Using web origin:', webUrl);
    return webUrl;
  }

  console.error('[tRPC] No base URL found. Please check environment variables.');
  console.error('[tRPC] Available env keys:', Object.keys(process.env).filter(k => k.startsWith('EXPO')));
  
  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL or EXPO_PUBLIC_TOOLKIT_URL"
  );
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
