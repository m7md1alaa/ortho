import { createFileRoute } from "@tanstack/react-router";
import { handler } from "@/lib/convex/auth/auth-server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        try {
          return handler(request);
        } catch (error) {
          console.error("GET /api/auth/$ error:", error);
          throw error;
        }
      },
      POST: ({ request }) => {
        try {
          return handler(request);
        } catch (error) {
          console.error("POST /api/auth/$ error:", error);
          throw error;
        }
      },
    },
  },
});
