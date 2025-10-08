import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { extractTokenFromHeader, verifyToken, JWTPayload } from "../utils/auth";
import { validateLicense } from "../utils/license";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);
  
  let user: JWTPayload | null = null;
  if (token) {
    user = verifyToken(token);
  }

  return {
    req: opts.req,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const licensedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const validation = await validateLicense(ctx.user.ownerId);
  
  if (!validation.isValid) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: validation.error || "License validation failed",
      cause: { renewUrl: validation.renewUrl },
    });
  }

  return next({
    ctx: {
      ...ctx,
      license: validation.license!,
    },
  });
});
