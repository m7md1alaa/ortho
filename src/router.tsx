import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import {
  ConvexReactClient,
  getConvexQueryClientSingleton,
  getQueryClientSingleton,
} from "better-convex/react";
import { initCRPC } from "@/lib/convex/crpc";
import { NotFound } from "./components/NotFound";
import { createQueryClient } from "./lib/convex/query-client";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const convexClientUrl: string | undefined | null = import.meta.env
    .VITE_CONVEX_URL;

  if (!convexClientUrl) {
    console.error("VITE_CONVEX_URL is not set");
    throw new Error("VITE_CONVEX_URL is not set");
  }

  const convex = new ConvexReactClient(convexClientUrl);
  const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL;

  if (!convexSiteUrl) {
    console.error("VITE_CONVEX_SITE_URL is not set");
    throw new Error("VITE_CONVEX_SITE_URL is not set");
  }

  const queryClient = getQueryClientSingleton(createQueryClient);
  const convexQueryClient = getConvexQueryClientSingleton({
    convex,
    queryClient,
  });

  initCRPC(convexSiteUrl);

  const router = createRouter({
    routeTree,
    context: {
      convex,
      queryClient,
      convexQueryClient,
      isAuthenticated: false,
      currentUser: null,
      token: null,
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });
  return router;
};
