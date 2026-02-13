import { createFileRoute, redirect } from "@tanstack/react-router";
import AuthComponent from "@/components/auth/form";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  beforeLoad: ({ context }) => {
    // Redirect to home if already authenticated
    if (context.isAuthenticated) {
      throw redirect({ to: "/lists" });
    }
  },
});

function AuthPage() {
  return <AuthComponent />;
}
