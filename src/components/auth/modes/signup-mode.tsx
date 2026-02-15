import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PasswordInput,
  PasswordInputStrengthChecker,
} from "@/components/ui/password-input";
import { APP_NAME } from "@/lib/constants";
import { useSignUpMutationOptions } from "@/lib/convex/auth/auth-mutations";
import { signUpSchema } from "@/lib/validation/auth";
import { AuthLayout } from "../components/auth-layout";
import { FormField } from "../components/form-field";

interface SignUpModeProps {
  onSuccess: () => void;
  onSocialSignIn: (provider: "google") => void;
  onSwitchToOTP: () => void;
  onSwitchToSignIn: () => void;
  isLoading: boolean;
}

export function SignUpMode({
  onSuccess,
  onSocialSignIn,
  onSwitchToOTP,
  onSwitchToSignIn,
  isLoading,
}: SignUpModeProps) {
  const [showPasswordAuth, setShowPasswordAuth] = useState(false);

  const signUp = useMutation(
    useSignUpMutationOptions({
      onSuccess,
    })
  );

  const signUpForm = useForm({
    defaultValues: {
      firstName: "",
      email: "",
      password: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      await signUp.mutateAsync({
        callbackURL: window.location.origin,
        email: value.email.trim(),
        name: value.firstName.trim(),
        password: value.password,
      });
    },
  });

  const footer = (
    <div className="space-y-2">
      <p className="text-center text-accent-foreground text-sm">
        <Button
          className="px-2 font-medium"
          disabled={isLoading}
          onClick={onSwitchToOTP}
          type="button"
          variant="link"
        >
          ← Back to code sign in
        </Button>
      </p>
      <p className="text-center text-accent-foreground text-sm">
        Have an account?{" "}
        <Button
          className="px-2"
          disabled={isLoading}
          onClick={onSwitchToSignIn}
          type="button"
          variant="link"
        >
          Sign In
        </Button>
      </p>
    </div>
  );

  return (
    <AuthLayout
      description={`Get started with ${APP_NAME}`}
      footer={footer}
      isLoading={isLoading}
      onGoogleSignIn={() => onSocialSignIn("google")}
      title="Create Account"
    >
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          signUpForm.handleSubmit();
        }}
      >
        <signUpForm.Field name="email">
          {(field) => (
            <FormField
              autoComplete="email"
              disabled={isLoading}
              error={field.state.meta.errors[0]?.message}
              id={field.name}
              isTouched={field.state.meta.isTouched}
              label="Email"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
              placeholder="you@example.com"
              type="email"
              value={field.state.value}
            />
          )}
        </signUpForm.Field>

        <signUpForm.Field name="firstName">
          {(field) => (
            <FormField
              autoComplete="given-name"
              disabled={isLoading}
              error={field.state.meta.errors[0]?.message}
              id={field.name}
              isTouched={field.state.meta.isTouched}
              label="First Name"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
              placeholder="John"
              value={field.state.value}
            />
          )}
        </signUpForm.Field>

        {showPasswordAuth && (
          <signUpForm.Field name="password">
            {(field) => (
              <FormField
                autoComplete="new-password"
                disabled={isLoading}
                error={field.state.meta.errors[0]?.message}
                id={field.name}
                isTouched={field.state.meta.isTouched}
                label="Password"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                value={field.state.value}
              >
                <PasswordInput
                  autoComplete="new-password"
                  disabled={isLoading}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                >
                  <PasswordInputStrengthChecker />
                </PasswordInput>
              </FormField>
            )}
          </signUpForm.Field>
        )}

        <signUpForm.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              className="w-full"
              disabled={!canSubmit}
              loading={isSubmitting || isLoading}
              type="submit"
            >
              Continue
            </Button>
          )}
        </signUpForm.Subscribe>

        {!showPasswordAuth && (
          <p className="text-center text-accent-foreground text-xs opacity-60">
            <Button
              className="px-2 text-xs"
              disabled={isLoading}
              onClick={() => setShowPasswordAuth(true)}
              size="sm"
              type="button"
              variant="link"
            >
              Set a password instead
            </Button>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
