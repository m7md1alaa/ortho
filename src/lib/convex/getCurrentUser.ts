import { createServerFn } from "@tanstack/react-start";
import { runServerCall } from "@/lib/convex/server.server";
import { getToken } from "./auth/auth-server";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const token = await getToken();
    if (!token) {
      return null;
    }

    return await runServerCall((caller) => caller.user.getSessionUser({}));
  }
);
