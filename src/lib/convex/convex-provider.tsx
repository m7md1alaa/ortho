import { QueryClientProvider } from "@tanstack/react-query";
import {
  rootRouteId,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { ConvexAuthProvider } from "better-convex/auth-client";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { CRPCProvider } from "@/lib/convex/crpc";
import { authClient } from "./auth/auth-client";

export function BetterConvexProvider({ children }: { children: ReactNode }) {
  const { token, convex } = useRouteContext({ from: rootRouteId });
  const router = useRouter();

  return (
    <ConvexAuthProvider
      authClient={authClient}
      client={convex}
      initialToken={token}
      onMutationUnauthorized={() => {
        router.navigate({ to: "/" });
      }}
      onQueryUnauthorized={({ queryName }) => {
        if (process.env.NODE_ENV === "development") {
          toast.error(`${queryName} requires authentication`);
        } else {
          router.navigate({ to: "/" });
        }
      }}
    >
      <QueryProvider>{children}</QueryProvider>
    </ConvexAuthProvider>
  );
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  const { convex, queryClient, convexQueryClient } = useRouteContext({
    from: rootRouteId,
  });
  return (
    <QueryClientProvider client={queryClient}>
      <CRPCProvider convexClient={convex} convexQueryClient={convexQueryClient}>
        {children}
      </CRPCProvider>
    </QueryClientProvider>
  );
}
