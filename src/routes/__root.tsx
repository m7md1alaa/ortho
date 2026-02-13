import type { Id } from "@convex/dataModel";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ConvexQueryClient, ConvexReactClient } from "better-convex/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { BetterConvexProvider } from "@/lib/convex/convex-provider";
import { getCurrentUser } from "@/lib/convex/getCurrentUser";
import { getSessionToken } from "@/lib/convex/getSessionToken";
import Header from "../components/Header";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

export interface CurrentUser {
  id: Id<"user">;
  email: string;
  image?: string | null;
  name: string;
}

export interface MyRouterContext {
  convex: ConvexReactClient;
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  token: string | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: `${APP_NAME} — ${APP_TAGLINE}`,
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  beforeLoad: async (ctx) => {
    const token = await getSessionToken();
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }
    let currentUser: CurrentUser | null = null;
    if (token) {
      try {
        currentUser = await getCurrentUser();
      } catch {
        // Error fetching user, will be handled client-side
      }
    }
    return {
      isAuthenticated: !!token && !!currentUser,
      currentUser,
      token,
    };
  },
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <BetterConvexProvider>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <TooltipProvider>
            <Header />
            {children}
          </TooltipProvider>
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
          <Scripts />
        </body>
      </html>
    </BetterConvexProvider>
  );
}
