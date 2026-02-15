import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useSignInSocialMutationOptions } from "@/lib/convex/auth/auth-mutations";
import { OTPSignInMode } from "./modes/otp-signin-mode";
import { SignInMode } from "./modes/signin-mode";
import { SignUpMode } from "./modes/signup-mode";

type AuthMode = "signup" | "signin" | "otp";

export default function AuthComponent() {
  const router = useRouter();
  const search = useSearch({ from: "/auth" });
  const mode = (search.mode as AuthMode) || "otp";

  const setMode = (newMode: AuthMode) => {
    router.navigate({
      to: "/auth",
      search: { mode: newMode },
      replace: true,
    });
  };

  const signInSocial = useMutation(
    useSignInSocialMutationOptions({
      onSuccess: () => router.navigate({ to: "/" }),
    })
  );

  const handleSuccess = () => {
    router.navigate({ to: "/" });
  };

  const handleSocialSignIn = async (provider: "google") => {
    try {
      await signInSocial.mutateAsync({
        provider,
        callbackURL: window.location.origin,
      });
    } catch (error) {
      console.error("Social sign-in error:", error);
    }
  };

  const isLoading = signInSocial.isPending;

  if (mode === "otp") {
    return (
      <OTPSignInMode
        isLoading={isLoading}
        onSocialSignIn={handleSocialSignIn}
        onSuccess={handleSuccess}
        onSwitchToPassword={() => setMode("signin")}
        onSwitchToSignUp={() => setMode("signup")}
      />
    );
  }

  if (mode === "signup") {
    return (
      <SignUpMode
        isLoading={isLoading}
        onSocialSignIn={handleSocialSignIn}
        onSuccess={handleSuccess}
        onSwitchToOTP={() => setMode("otp")}
        onSwitchToSignIn={() => setMode("signin")}
      />
    );
  }

  return (
    <SignInMode
      isLoading={isLoading}
      onSocialSignIn={handleSocialSignIn}
      onSuccess={handleSuccess}
      onSwitchToOTP={() => setMode("otp")}
      onSwitchToSignUp={() => setMode("signup")}
    />
  );
}
