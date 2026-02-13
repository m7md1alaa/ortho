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
import { BetterConvexProvider } from "@/lib/convex/convex-provider";
import { getCurrentUser } from "@/lib/convex/getCurrentUser";
import { getSessionToken } from "@/lib/convex/getSessionToken";
import Header from "../components/Header";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
export interface MyRouterContext {
  convex: ConvexReactClient;
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
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
        title: "Ortho — Spelling as Craft",
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
    const token = await getSessionToken(); // a server function that calls the getToken function in auth-server.ts and returns the token
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }
    const currentUser = token ? await getCurrentUser() : null;
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
