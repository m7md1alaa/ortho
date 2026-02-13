import { getHeaders, getSession } from "better-convex/auth";
import { api } from "../functions/_generated/api";
import { CRPCError, initCRPC } from "better-convex/server";
import type { Auth } from "convex/server";
import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import type { DataModel, Id } from "../functions/_generated/dataModel";
import type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from "../functions/_generated/server";
import {
  action,
  httpAction,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../functions/_generated/server";
import { getAuth } from "../functions/auth";
import { type CtxWithTable, getCtxWithTable } from "./ents";
import { rateLimitGuard } from "./rate-limiter";
import { registerTriggers } from "./triggers";

// =============================================================================
// Types

export type GenericCtx = QueryCtx | MutationCtx | ActionCtx;

interface SessionUser {
  id: Id<"user">;
}

/** Context with required auth - user/userId guaranteed */
export type AuthCtx<Ctx extends MutationCtx | QueryCtx = QueryCtx> =
  CtxWithTable<Ctx> & {
    auth: Auth & ReturnType<typeof getAuth> & { headers: Headers };
    user: SessionUser;
    userId: Id<"user">;
  };

/** Context type for authenticated actions */
export type AuthActionCtx = ActionCtx & {
  user: SessionUser;
  userId: Id<"user">;
};

// =============================================================================
// Setup
// =============================================================================

const triggers = registerTriggers();

interface Meta {
  auth?: "optional" | "required";
  rateLimit?: string;
  dev?: boolean;
}

const c = initCRPC
  .dataModel<DataModel>()
  .context({
    query: (ctx) => getCtxWithTable(ctx),
    mutation: (ctx) => getCtxWithTable(ctx),
  })
  .meta<Meta>()
  .create({
    query,
    internalQuery,
    // biome-ignore lint/suspicious/noExplicitAny: convex internals
    mutation: (handler: any) =>
      mutation({
        ...handler,
      }),
    // biome-ignore lint/suspicious/noExplicitAny: convex internals
    internalMutation: (handler: any) =>
      internalMutation({
        ...handler,
      }),
    action,
    internalAction,
    httpAction,
  });

// =============================================================================
// Middleware
// =============================================================================

/** Dev mode middleware - throws in production if meta.dev: true */
const devMiddleware = c.middleware<object>(({ meta, next, ctx }) => {
  if (meta.dev && process.env.DEPLOY_ENV === "production") {
    throw new CRPCError({
      code: "FORBIDDEN",
      message: "This function is only available in development",
    });
  }
  return next({ ctx });
});

/** Rate limit middleware - applies rate limiting based on meta.rateLimit and user tier */
const rateLimitMiddleware = c.middleware<
  MutationCtx & { user?: Pick<SessionUser, "id"> | null }
>(async ({ ctx, meta, next }) => {
  await rateLimitGuard({
    ...ctx,
    rateLimitKey: meta.rateLimit ?? "default",
    user: ctx.user ?? null,
  });
  return next({ ctx });
});

// =============================================================================
// Query Procedures
// =============================================================================

/** Public query - no auth required, supports dev: true in meta */
export const publicQuery = c.query.use(devMiddleware);

/** Private query - only callable from other Convex functions */
export const privateQuery = c.query.internal();

/** Auth query - ctx.user required, supports dev: true in meta */
export const authQuery = c.query
  .meta({ auth: "required" })
  .use(devMiddleware)
  .use(async ({ ctx, next }) => {
    const session = await getSession(ctx);
    if (!session) {
      throw new CRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const user = await ctx.table("user").getX(session.userId);

    return next({
      ctx: {
        ...ctx,
        auth: {
          ...ctx.auth,
          ...getAuth(ctx),
          headers: await getHeaders(ctx, session),
        },
        user: { id: user._id, session, ...user.doc() },
        userId: user._id,
      },
    });
  });

// =============================================================================
// Mutation Procedures
// =============================================================================

/** Public mutation - no auth required, rate limited, supports dev: true in meta */
export const publicMutation = c.mutation.use(devMiddleware);
// .use(rateLimitMiddleware);

/** Private mutation - only callable from other Convex functions */
export const privateMutation = c.mutation.internal();

/** Auth mutation - ctx.user required, rate limited, dev: true */
export const authMutation = c.mutation
  .meta({ auth: "required" })
  .use(devMiddleware)
  .use(async ({ ctx, next }) => {
    const session = await getSession(ctx);
    if (!session) {
      throw new CRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const user = await ctx.table("user").getX(session.userId);

    return next({
      ctx: {
        ...ctx,
        auth: {
          ...ctx.auth,
          ...getAuth(ctx),
          headers: await getHeaders(ctx, session),
        },
        user: { id: user._id, session, ...user.doc() },
        userId: user._id,
      },
    });
  })
  .use(rateLimitMiddleware);

// =============================================================================
// Action Procedures
// =============================================================================

/** Public action - no auth required, supports dev: true in meta */
export const publicAction = c.action.use(devMiddleware);

/** Private action - only callable from other Convex functions */
export const privateAction = c.action.internal();

/** Auth action - ctx.user required, supports dev: true in meta */
export const authAction = c.action
  .meta({ auth: "required" })
  .use(devMiddleware)
  .use(async ({ ctx, next }) => {
    // Actions don't have db access - use runQuery
    const rawUser = await ctx.runQuery(api.user.getSessionUser, {});
    if (!rawUser) {
      throw new CRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }
    return next({
      ctx: { ...ctx, user: rawUser as SessionUser, userId: rawUser.id },
    });
  });

// =============================================================================
// HTTP Action Procedures
// =============================================================================

/** Public HTTP route - no auth required */
export const publicRoute = c.httpAction;

/** Auth HTTP route - verifies JWT via ctx.auth.getUserIdentity() */
export const authRoute = c.httpAction.use(async ({ ctx, next }) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({
    ctx: { ...ctx, userId: identity.subject as Id<"user"> },
  });
});

/** HTTP router factory - create nested HTTP routers like tRPC */
export const router = c.router;

// =============================================================================
// Exports for Better Auth
// =============================================================================

/** Trigger-wrapped internalMutation for better-auth hooks */
export const internalMutationWithTriggers = customMutation(
  internalMutation,
  customCtx(async (ctx) => ({
    db: triggers.wrapDB(ctx).db,
  }))
);
