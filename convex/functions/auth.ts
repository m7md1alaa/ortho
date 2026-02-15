/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { createApi, createClient } from "better-convex/auth";
import type { GenericCtx } from "../lib/crpc";
import { internalMutationWithTriggers } from "../lib/crpc";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "../shared/validation";
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
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `Ortho <${process.env.RESEND_FROM_EMAIL}>`,
              to: email,
              subject:
                type === "sign-in" ? "Your sign-in code" : "Verify your email",
              html: `
                <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #333; margin-bottom: 20px;">Your verification code</h2>
                  <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; 
                            background: #f5f5f5; padding: 20px; text-align: center; 
                            border-radius: 8px; margin: 20px 0; color: #000;">
                    ${otp}
                  </p>
                  <p style="color: #666; margin-top: 20px;">This code expires in 5 minutes.</p>
                  <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this, you can ignore this email.</p>
                </div>
              `,
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to send email: ${error}`);
          }
        },
        otpLength: 6,
        expiresIn: 300,
        disableSignUp: false,
      }),
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24 * 15,
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      maxPasswordLength: MAX_PASSWORD_LENGTH,
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
