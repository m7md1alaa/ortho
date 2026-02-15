import {
  AuthMutationError,
  createAuthMutations,
  useAuthStore,
} from "better-convex/react";
import { authClient } from "./auth-client";

export const {
  useSignInMutationOptions,
  useSignInSocialMutationOptions,
  useSignOutMutationOptions,
  useSignUpMutationOptions,
} = createAuthMutations(authClient);

/** Poll until JWT token exists (auth complete) (max 5s) */
const waitForAuth = async (
  store: ReturnType<typeof useAuthStore>,
  timeout = 5000
): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (store.get("token")) {
      return;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
};

// Send OTP mutation for passwordless sign-in
export const useSendOTPMutationOptions = (options?: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: AuthMutationError) => void;
}) => {
  return {
    ...options,
    mutationFn: async ({ email }: { email: string }) => {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (result?.error) {
        throw new AuthMutationError(result.error);
      }
      return result.data;
    },
  };
};

// Verify OTP and sign in mutation
export const useVerifyOTPMutationOptions = (options?: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: AuthMutationError) => void;
}) => {
  const authStoreApi = useAuthStore();

  return {
    ...options,
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
      });
      if (result?.error) {
        throw new AuthMutationError(result.error);
      }
      // Wait for auth token to be set (like other auth mutations)
      await waitForAuth(authStoreApi);
      return result.data;
    },
  };
};
