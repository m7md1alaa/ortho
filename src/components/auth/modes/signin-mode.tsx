import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { APP_NAME } from "@/lib/constants";
import { useSignInMutationOptions } from "@/lib/convex/auth/auth-mutations";
import { signInSchema } from "@/lib/validation/auth";
import { AuthLayout } from "../components/auth-layout";
import { FormField } from "../components/form-field";

interface SignInModeProps {
  onSuccess: () => void;
  onSocialSignIn: (provider: "google") => void;
  onSwitchToOTP: () => void;
  onSwitchToSignUp: () => void;
  isLoading: boolean;
}

export function SignInMode({
  onSuccess,
  onSocialSignIn,
  onSwitchToOTP,
  onSwitchToSignUp,
  isLoading,
}: SignInModeProps) {
  const signIn = useMutation(
    useSignInMutationOptions({
      onSuccess,
    })
  );

  const signInForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onChange: signInSchema,
    },
    onSubmit: async ({ value }) => {
      await signIn.mutateAsync({
        callbackURL: window.location.origin,
        email: value.email.trim(),
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
        Don't have an account?{" "}
        <Button
          className="px-2"
          disabled={isLoading}
          onClick={onSwitchToSignUp}
          type="button"
          variant="link"
        >
          Create account
        </Button>
      </p>
    </div>
  );

  return (
    <AuthLayout
      description="Welcome back! Sign in to continue"
      footer={footer}
      isLoading={isLoading}
      onGoogleSignIn={() => onSocialSignIn("google")}
      title={`Sign In to ${APP_NAME}`}
    >
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          signInForm.handleSubmit();
        }}
      >
        <signInForm.Field name="email">
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
        </signInForm.Field>

        <signInForm.Field name="password">
          {(field) => (
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm" htmlFor={field.name}>
                  Password
                </Label>
                <Button
                  disabled={isLoading}
                  onClick={() => {
                    window.location.href = "/forgot-password";
                  }}
                  size="sm"
                  type="button"
                  variant="link"
                >
                  Forgot your Password?
                </Button>
              </div>
              <PasswordInput
                autoComplete="current-password"
                disabled={isLoading}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                value={field.state.value}
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-sm">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
            </div>
          )}
        </signInForm.Field>

        <signInForm.Subscribe
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
              Sign In
            </Button>
          )}
        </signInForm.Subscribe>
      </form>
    </AuthLayout>
  );
}
