import { createServerFn } from "@tanstack/react-start";
import { getToken } from "@/lib/convex/auth/auth-server";

export const getSessionToken = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getToken();
  }
);
