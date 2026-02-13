import "../lib/http-polyfills";
import { authMiddleware } from "better-convex/auth";
import { createHttpRouter } from "better-convex/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { router } from "../lib/crpc";

// Import your routers from convex/routers/
import { createAuth } from "./auth";

const app = new Hono();

// CORS for API routes (auth + cRPC)
app.use(
  "/api/*",
  cors({
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    origin: process.env.SITE_URL!,
    allowHeaders: ["Content-Type", "Authorization", "Better-Auth-Cookie"],
    exposeHeaders: ["Set-Better-Auth-Cookie"],
    credentials: true,
  })
);

// Better Auth middleware
app.use(authMiddleware(createAuth));

// HTTP API router (tRPC-style)
export const appRouter = router({
  // Add your routers here
});

export default createHttpRouter(app, appRouter);
