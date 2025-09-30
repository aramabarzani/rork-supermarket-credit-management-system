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
        console.log('tRPC Request options:', JSON.stringify(options, null, 2));
        try {
          const response = await fetch(url, options);
          console.log('tRPC Response status:', response.status);
          if (!response.ok) {
            const text = await response.text();
            console.error('tRPC Response error:', text);
          }
          return response;
        } catch (error) {
          console.error('tRPC Fetch error:', error);
          console.error('tRPC Fetch error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            url,
            baseUrl: getBaseUrl(),
          });
          throw error;
        }
      },
    }),
  ],
});