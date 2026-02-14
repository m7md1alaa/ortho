import { createServerFn } from "@tanstack/react-start";
import { runServerCall } from "@/lib/convex/server.server";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    return await runServerCall((caller) => caller.user.getSessionUser({}));
  }
);
