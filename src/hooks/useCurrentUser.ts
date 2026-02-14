import { useQuery } from "@tanstack/react-query";
import { useCRPC } from "@/lib/convex/crpc";

export function useCurrentUser() {
  const crpc = useCRPC();
  return useQuery(crpc.user.getSessionUser.queryOptions({}));
}
