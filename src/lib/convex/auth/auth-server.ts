/** biome-ignore-all lint/style/noNonNullAssertion: env */
import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";

const convexUrl =
  process.env.CONVEX_URL ||
  import.meta.env.VITE_CONVEX_URL ||
  process.env.VITE_CONVEX_URL;
const convexSiteUrl =
  process.env.CONVEX_SITE_URL ||
  import.meta.env.VITE_CONVEX_SITE_URL ||
  process.env.VITE_CONVEX_SITE_URL;

if (!convexUrl) {
  throw new Error("CONVEX_URL is not set");
}
if (!convexSiteUrl) {
  throw new Error("CONVEX_SITE_URL is not set");
}

const auth = convexBetterAuthReactStart({
  convexUrl,
  convexSiteUrl,
});

export const {
  handler,
  getToken: originalGetToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = auth;

export async function getToken(): Promise<string | null> {
  try {
    const token = await originalGetToken();
    return token ?? null;
  } catch {
    return null;
  }
}
