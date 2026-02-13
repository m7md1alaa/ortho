/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { createApi, createClient } from "better-convex/auth";
import type { GenericCtx } from "../lib/crpc";
import { internalMutationWithTriggers } from "../lib/crpc";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import authConfig from "./auth.config";
import schema from "./schema";

const authFunctions = internal.auth;

export const authClient = createClient<DataModel, typeof schema>({
  authFunctions,
  schema,
  internalMutation: internalMutationWithTriggers,
  triggers: {
    user: {
      beforeCreate: async (_ctx: GenericCtx, data) => {
        const username =
          data.username?.trim() ||
          data.email?.split("@")[0] ||
          `user-${Date.now()}`;
        return await { ...data, username };
      },
    },
  },
});

export const createAuthOptions = (ctx: GenericCtx) =>
  ({
    baseURL: process.env.SITE_URL!,
    database: authClient.httpAdapter(ctx),
    plugins: [
      convex({
        authConfig,
        jwks: process.env.JWKS,
        jwt: {
          expirationSeconds: 60 * 60,
        },
      }),
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24 * 15,
    },
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    trustedOrigins: [process.env.SITE_URL ?? "http://localhost:3000"],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx) =>
  betterAuth(createAuthOptions(ctx));

export const getAuth = <Ctx extends QueryCtx | MutationCtx>(ctx: Ctx) => {
  return betterAuth({
    ...createAuthOptions(ctx),
    database: authClient.adapter(ctx, createAuthOptions),
  });
};

export const {
  beforeCreate,
  beforeDelete,
  beforeUpdate,
  onCreate,
  onDelete,
  onUpdate,
} = authClient.triggersApi();

export const {
  create,
  deleteMany,
  deleteOne,
  findMany,
  findOne,
  updateMany,
  updateOne,
  getLatestJwks,
  rotateKeys,
} = createApi(schema, createAuth, {
  internalMutation: internalMutationWithTriggers,
  skipValidation: true,
});

export const auth = betterAuth(createAuthOptions({} as GenericCtx));
