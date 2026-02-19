import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunking based on module path
          if (id.includes("node_modules")) {
            // TanStack ecosystem
            if (
              id.includes("@tanstack/react-router") ||
              id.includes("@tanstack/router") ||
              id.includes("@tanstack/react-query") ||
              id.includes("@tanstack/react-form") ||
              id.includes("@tanstack/react-store") ||
              id.includes("@tanstack/store")
            ) {
              return "vendor-tanstack";
            }
            // UI libraries
            if (
              id.includes("@base-ui/react") ||
              id.includes("lucide-react") ||
              id.includes("input-otp")
            ) {
              return "vendor-ui";
            }
            // Auth libraries
            if (id.includes("better-auth") || id.includes("better-convex")) {
              return "vendor-auth";
            }

            // Convex ecosystem
            if (
              id.includes("convex") ||
              id.includes("convex-ents") ||
              id.includes("convex-helpers")
            ) {
              return "vendor-convex";
            }
            // Other large libraries
            if (id.includes("sonner")) {
              return "vendor-notifications";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  plugins: [
    devtools(),
    nitro({ preset: "vercel" }),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});

export default config;
