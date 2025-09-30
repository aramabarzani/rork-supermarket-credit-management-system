import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Mock user for development - in production, extract from auth token
  const mockUser = {
    id: '1',
    name: 'بەڕێوەبەر',
    phone: '07501234567',
    role: 'admin' as const,
  };

  return {
    req: opts.req,
    user: mockUser,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure (add authentication logic here)
export const protectedProcedure = t.procedure.use(async ({ next }) => {
  // Add authentication check here
  // For now, we'll just pass through
  return next();
});