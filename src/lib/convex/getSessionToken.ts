import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getToken as originalGetToken } from "@/lib/convex/auth/auth-server";

export const getSessionToken = createServerFn({ method: "GET" }).handler(
  async () => {
    const token = await originalGetToken();
    if (token) {
      return token;
    }

    const headers = await getRequestHeaders();
    const baseUrl =
      process.env.SITE_URL ||
      process.env.VITE_SITE_URL ||
      "http://localhost:3000";

    try {
      const response = await fetch(`${baseUrl}/api/auth/convex/token`, {
        method: "GET",
        headers: {
          cookie: headers.get("cookie") || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.token || null;
      }
    } catch {
      return null;
    }

    return null;
  }
);
