/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";

const convexUrl = process.env.CONVEX_URL || import.meta.env.VITE_CONVEX_URL;
const convexSiteUrl =
  process.env.CONVEX_SITE_URL || import.meta.env.VITE_CONVEX_SITE_URL;

console.log("auth-server.ts - convexUrl:", convexUrl);
console.log("auth-server.ts - convexSiteUrl:", convexSiteUrl);

if (!convexUrl) {
  throw new Error("CONVEX_URL is not set");
}
if (!convexSiteUrl) {
  throw new Error("CONVEX_SITE_URL is not set");
}

export const {
  handler,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthReactStart({
  convexUrl,
  convexSiteUrl,
});
