import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import AuthComponent from "@/components/auth/form";

const authSearchSchema = z.object({
  mode: z.enum(["signup", "signin", "otp"]).default("otp"),
});

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: authSearchSchema,
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
