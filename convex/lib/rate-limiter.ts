import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { CRPCError } from "better-convex/server";
import { components } from "../functions/_generated/api";
import type { MutationCtx } from "../functions/_generated/server";

const rateLimitConfig = {
  "word/create": { kind: "fixed window", period: MINUTE, rate: 5 },
  "list/create": { kind: "fixed window", period: MINUTE, rate: 5 },
  default: { kind: "fixed window", period: MINUTE, rate: 30 },
} as const;

export const rateLimiter = new RateLimiter(components.rateLimiter);

interface SessionUser {
  id: string;
}

export async function rateLimitGuard(
  ctx: MutationCtx & {
    rateLimitKey: string;
    user: Pick<SessionUser, "id"> | null;
  }
) {
  const identifier = ctx.user?.id ?? "anonymous";

  const status = await rateLimiter.limit(ctx, ctx.rateLimitKey, {
    key: identifier,
    config:
      rateLimitConfig[ctx.rateLimitKey as keyof typeof rateLimitConfig] ??
      rateLimitConfig.default,
  });

  if (!status.ok) {
    throw new CRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded. Please try again later.",
    });
  }
}
