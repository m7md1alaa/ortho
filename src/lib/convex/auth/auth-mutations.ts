import { createAuthMutations } from "better-convex/react";
import { authClient } from "./auth-client";

export const {
  useSignInMutationOptions,
  useSignInSocialMutationOptions,
  useSignOutMutationOptions,
  useSignUpMutationOptions,
} = createAuthMutations(authClient);
