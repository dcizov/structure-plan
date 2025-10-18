import { ORPCError, os } from "@orpc/server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function createRPCContext(opts: { headers: Headers }) {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    db,
    headers: opts.headers,
    session,
  };
}

const o = os.$context<
  Awaited<ReturnType<typeof createRPCContext>> & {
    _timingLogged?: boolean;
  }
>();

const timingMiddleware = o.middleware(async ({ context, next, path }) => {
  const shouldLog = !context._timingLogged;

  const start = shouldLog ? Date.now() : 0;

  try {
    return await next({
      context: {
        _timingLogged: true,
      },
    });
  } finally {
    if (shouldLog) {
      console.log(
        `[oRPC] ${path.join(".")} took ${Date.now() - start}ms to execute`,
      );
    }
  }
});

export const publicProcedure = o.use(timingMiddleware);

export const protectedProcedure = publicProcedure.use(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      session: { ...context.session, user: context.session.user },
    },
  });
});

// eslint-disable-next-line @typescript-eslint/unbound-method
export const router = os.router;
