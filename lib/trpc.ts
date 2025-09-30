import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using EXPO_PUBLIC_RORK_API_BASE_URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    console.log('Using window.location.origin:', window.location.origin);
    return window.location.origin;
  }

  console.log('Using default localhost:8081');
  return 'http://localhost:8081';
};

console.log('tRPC Base URL:', getBaseUrl());

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        console.log('tRPC Request:', url);
        try {
          const response = await fetch(url, options);
          console.log('tRPC Response status:', response.status);
          return response;
        } catch (error) {
          console.error('tRPC Fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});