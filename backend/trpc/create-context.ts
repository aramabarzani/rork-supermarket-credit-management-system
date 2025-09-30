import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { User } from "@/types/auth";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  return {
    req: opts.req,
    token: token || null,
    user: null as User | null,
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
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.token) {
    throw new Error('UNAUTHORIZED');
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      token: ctx.token,
    },
  });
});