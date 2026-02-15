import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useSendOTPMutationOptions,
  useVerifyOTPMutationOptions,
} from "@/lib/convex/auth/auth-mutations";
import {
  firstNameSchema,
  otpSendSchema,
  otpVerifySchema,
} from "@/lib/validation/auth";
import { AuthLayout } from "../components/auth-layout";
import { FormField } from "../components/form-field";

interface OTPSignInModeProps {
  onSuccess: () => void;
  onSocialSignIn: (provider: "google") => void;
  onSwitchToPassword: () => void;
  onSwitchToSignUp: () => void;
  isLoading: boolean;
}

export function OTPSignInMode({
  onSuccess,
  onSocialSignIn,
  onSwitchToPassword,
  onSwitchToSignUp,
  isLoading,
}: OTPSignInModeProps) {
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const sendOTP = useMutation(
    useSendOTPMutationOptions({
      onSuccess: () => setOtpSent(true),
    })
  );

  const verifyOTP = useMutation(
    useVerifyOTPMutationOptions({
      onSuccess: () => setOtpVerified(true),
    })
  );

  const otpSendForm = useForm({
    defaultValues: {
      email: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onChange: otpSendSchema,
    },
    onSubmit: async ({ value }) => {
      await sendOTP.mutateAsync({ email: value.email.trim() });
      setOtpEmail(value.email.trim());
    },
  });

  const otpVerifyForm = useForm({
    defaultValues: {
      otp: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onChange: otpVerifySchema,
    },
    onSubmit: async ({ value }) => {
      await verifyOTP.mutateAsync({ email: otpEmail, otp: value.otp });
    },
  });

  const nameForm = useForm({
    defaultValues: {
      firstName: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onChange: firstNameSchema,
    },
    onSubmit: () => {
      // Complete the signup/signin process with the name
      // TODO: Send name to backend
      onSuccess();
    },
  });

  const title = otpVerified ? "Welcome!" : "Sign In";
  let description: string;
  if (otpVerified) {
    description = "Tell us your name to get started";
  } else if (otpSent) {
    description = "Enter the code sent to your email";
  } else {
    description = "We'll send a verification code to your email";
  }

  const footer = otpVerified ? undefined : (
    <p className="text-center text-accent-foreground text-sm">
      New here?{" "}
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
  );

  function renderContent() {
    if (otpVerified) {
      return (
        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            nameForm.handleSubmit();
          }}
        >
          <nameForm.Field name="firstName">
            {(field) => (
              <FormField
                autoComplete="given-name"
                autoFocus
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
          </nameForm.Field>

          <nameForm.Subscribe
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
                Get Started
              </Button>
            )}
          </nameForm.Subscribe>
        </form>
      );
    }

    if (otpSent) {
      return (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            otpVerifyForm.handleSubmit();
          }}
        >
          <otpVerifyForm.Field name="otp">
            {(field) => (
              <FormField
                autoComplete="one-time-code"
                disabled={isLoading}
                error={field.state.meta.errors[0]?.message}
                id={field.name}
                isTouched={field.state.meta.isTouched}
                label="Verification Code"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                placeholder="Enter code"
                value={field.state.value}
              />
            )}
          </otpVerifyForm.Field>

          <otpVerifyForm.Subscribe
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
                Verify Code
              </Button>
            )}
          </otpVerifyForm.Subscribe>

          <div className="flex flex-col gap-2">
            <p className="text-center text-accent-foreground text-xs opacity-60">
              Didn't receive the code?{" "}
              <Button
                className="px-1 text-xs"
                disabled={isLoading}
                onClick={() => setOtpSent(false)}
                type="button"
                variant="link"
              >
                Resend
              </Button>
            </p>
            <Button
              className="w-full"
              disabled={isLoading}
              onClick={() => setOtpSent(false)}
              type="button"
              variant="outline"
            >
              Back to Email
            </Button>
          </div>
        </form>
      );
    }

    return (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          otpSendForm.handleSubmit();
        }}
      >
        <otpSendForm.Field name="email">
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
        </otpSendForm.Field>

        <otpSendForm.Subscribe
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
        </otpSendForm.Subscribe>

        <p className="text-center text-accent-foreground text-xs opacity-60">
          <Button
            className="px-2 text-xs"
            disabled={isLoading}
            onClick={onSwitchToPassword}
            size="sm"
            type="button"
            variant="link"
          >
            Use password instead
          </Button>
        </p>
      </form>
    );
  }

  return (
    <AuthLayout
      description={description}
      footer={footer}
      isLoading={isLoading}
      onGoogleSignIn={() => onSocialSignIn("google")}
      showGoogleButton={!otpVerified}
      title={title}
    >
      {renderContent()}
    </AuthLayout>
  );
}
