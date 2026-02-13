import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAuth } from "better-convex/react";
import AuthAvatar from "@/components/auth/auth-avatar";
import { useSignOutMutationOptions } from "@/lib/convex/auth/auth-mutations";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface AuthSectionProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: ReturnType<typeof useMutation>;
}

function renderAuthSection({
  isLoading,
  isAuthenticated,
  signOut,
}: AuthSectionProps) {
  if (isLoading) {
    return <Spinner className="text-zinc-500" />;
  }

  if (isAuthenticated) {
    return (
      <>
        <Button
          className="cursor-pointer font-mono disabled:cursor-not-allowed disabled:opacity-50"
          loading={signOut.isPending}
          onClick={() => signOut.mutate(undefined)}
        >
          Sign out
        </Button>
        <AuthAvatar />
      </>
    );
  }

  return (
    <Link className="hover-underline font-mono" to="/auth">
      Sign in
    </Link>
  );
}

export default function Header() {
  const signOut = useMutation(useSignOutMutationOptions());
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-[#2a2a2c] border-b bg-[#0a0a0b]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          <Link className="group flex items-center gap-3" to="/">
            <div className="flex h-8 w-8 items-center justify-center border border-[#2d6b6b] transition-all duration-300 group-hover:bg-[#2d6b6b]/10">
              <span className="font-display text-[#f5f5f0] text-lg leading-none">
                O
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-8 font-mono">
            <Link
              activeProps={{ className: "text-[#f5f5f0]" }}
              className="hover-underline font-mono"
              to="/"
            >
              Home
            </Link>
            <Link
              activeProps={{ className: "text-[#f5f5f0]" }}
              className="hover-underline font-mono"
              to="/lists"
            >
              Lists
            </Link>
            {renderAuthSection({ isLoading, isAuthenticated, signOut })}
          </nav>
        </div>
      </div>
    </header>
  );
}
