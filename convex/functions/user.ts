import { zid } from "convex-helpers/server/zod4";
import { z } from "zod";
import { authQuery } from "../lib/crpc";

/** Get session user - requires authentication */
export const getSessionUser = authQuery
  .output(
    z.object({
      id: zid("user"),
      email: z.string(),
      image: z.string().nullish(),
      name: z.string(),
    })
  )
  // biome-ignore lint/suspicious/useAwait: <explanation>
  .query(async ({ ctx }) => {
    const { user } = ctx;
    return {
      id: user.id,
      email: user.email,
      image: user.image,
      name: user.name,
    };
  });
