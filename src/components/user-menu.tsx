import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMaybeAuth } from "better-convex/react";
import { LogOutIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSignOutMutationOptions } from "@/lib/convex/auth/auth-mutations";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export default function UserMenu() {
  const isAuth = useMaybeAuth();
  const navigate = useNavigate();
  const signOut = useMutation(useSignOutMutationOptions());
  const { data: currentUser, isPending } = useCurrentUser();

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: "/" });
      },
    });
  };

  if (!isAuth) {
    return null;
  }

  if (isPending) {
    return <Spinner className="text-zinc-500" />;
  }

  if (!currentUser) {
    return null;
  }

  const userName =
    currentUser.name || currentUser.email?.split("@")[0] || "User";
  const imageUrl =
    currentUser.image ||
    `https://avatar.vercel.sh/${encodeURIComponent(userName)}?size=60`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => (
          <Button
            {...props}
            aria-label="User menu"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2"
            type="button"
          >
            <Avatar>
              <AvatarImage src={imageUrl} />
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
          </Button>
        )}
      />
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link className="flex w-full items-center gap-2" to="/profile">
            <UserIcon className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOutIcon className="size-4 text-destructive" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
