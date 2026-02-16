import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  compatibilityDate: "2024-09-19",
  preset: "cloudflare_module",
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    wrangler: {
      name: "ortho",
      vars: {
        BETTER_AUTH_URL: "https://ortho.mohdalaa.com",
        VITE_SITE_URL: "https://ortho.mohdalaa.com",
        VITE_CONVEX_URL: "https://striped-grasshopper-852.convex.cloud",
        VITE_CONVEX_SITE_URL: "https://striped-grasshopper-852.convex.site",
        CONVEX_URL: "https://striped-grasshopper-852.convex.cloud",
        CONVEX_SITE_URL: "https://striped-grasshopper-852.convex.site",
        NEXT_PUBLIC_CONVEX_URL: "https://striped-grasshopper-852.convex.cloud",
      },
    },
  },
});
