import { rootRouteId, useRouteContext } from "@tanstack/react-router";
import { useMaybeAuth } from "better-convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AuthAvatar() {
  const { currentUser } = useRouteContext({ from: rootRouteId });
  const isAuth = useMaybeAuth();

  if (!(isAuth && currentUser)) {
    return null;
  }

  const userName = currentUser?.name || currentUser?.email?.split("@")[0] || "User";
  const imageUrl =
    currentUser?.image ||
    `https://avatar.vercel.sh/${encodeURIComponent(userName)}?size=60`;

  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={imageUrl} />
        <AvatarFallback>{userName[0]}</AvatarFallback>
      </Avatar>
    </div>
  );
}
