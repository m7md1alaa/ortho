import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSignOutMutationOptions } from "@/lib/convex/auth/auth-mutations";

export default function SignOutPage() {
  const navigate = useNavigate();
  const signOut = useMutation(useSignOutMutationOptions());

  useEffect(() => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: "/" });
      },
    });
  }, [signOut, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
      <div className="text-center">
        <h1 className="mb-4 font-bold text-2xl">Signing out...</h1>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/profile/sign-out")({
  component: SignOutPage,
});
