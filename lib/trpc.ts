import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (process.env.EXPO_PUBLIC_TOOLKIT_URL) {
    return process.env.EXPO_PUBLIC_TOOLKIT_URL;
  }

  console.error('[tRPC] No base URL found. Please check environment variables.');
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
        return {
          authorization: token ? `Bearer ${token}` : "",
        };
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
