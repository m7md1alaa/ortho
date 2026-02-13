import { api } from "@convex/api";
import { meta } from "@convex/meta";
import { createCRPCContext } from "better-convex/react";
import type { ComponentProps } from "react";

type CRPCContext = ReturnType<typeof createCRPCContext<typeof api>>;

let crpcContext: CRPCContext | null = null;

export function initCRPC(convexSiteUrl: string) {
  if (!crpcContext) {
    crpcContext = createCRPCContext<typeof api>({
      api,
      meta,
      convexSiteUrl,
    });
  }

  return crpcContext;
}

function getCRPCContext() {
  if (!crpcContext) {
    throw new Error("CRPC context not initialized");
  }

  return crpcContext;
}

type CRPCProviderProps = ComponentProps<CRPCContext["CRPCProvider"]>;

export function CRPCProvider(props: CRPCProviderProps) {
  const { CRPCProvider: Provider } = getCRPCContext();

  return <Provider {...props} />;
}

export function useCRPC() {
  return getCRPCContext().useCRPC();
}

export function useCRPCClient() {
  return getCRPCContext().useCRPCClient();
}
