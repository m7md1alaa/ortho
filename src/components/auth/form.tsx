import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearch } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import {
  useSignInMutationOptions,
  useSignInSocialMutationOptions,
  useSignUpMutationOptions,
} from "@/lib/convex/auth/auth-mutations";
import { signInSchema, signUpSchema } from "./schema";

type AuthMode = "signup" | "signin";

export default function AuthComponent() {
  const router = useRouter();
  const search = useSearch({ from: "/auth" });
  const mode = (search.mode as AuthMode) || "signup";

  const setMode = (newMode: AuthMode) => {
    router.navigate({
      to: "/auth",
      search: { mode: newMode },
      replace: true,
    });
  };

  const signIn = useMutation(
    useSignInMutationOptions({
      onSuccess: () => router.navigate({ to: "/" }),
    })
  );

  const signInSocial = useMutation(
    useSignInSocialMutationOptions({
      onSuccess: () => router.navigate({ to: "/" }),
    })
  );

  const signUp = useMutation(
    useSignUpMutationOptions({
      onSuccess: () => router.navigate({ to: "/" }),
    })
  );

  const handleSocialSignIn = async (provider: "google" | "microsoft") => {
    try {
      await signInSocial.mutateAsync({
        provider,
        callbackURL: window.location.origin,
      });
    } catch (error) {
      console.error("Social sign-in error:", error);
    }
  };

  const signUpForm = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      const name = `${value.firstName.trim()} ${value.lastName.trim()}`.trim();
      await signUp.mutateAsync({
        callbackURL: window.location.origin,
        email: value.email.trim(),
        name,
        password: value.password,
      });
    },
  });

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

  const isLoading =
    signUp.isPending || signIn.isPending || signInSocial.isPending;

  if (mode === "signup") {
    return (
      <section className="flex min-h-screen bg-black px-4 py-16 md:py-32">
        <form
          className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            signUpForm.handleSubmit();
          }}
        >
          <div className="p-8 pb-6">
            <div>
              <a aria-label="go home" href="/">
                <GalleryVerticalEnd />
              </a>
              <h1 className="mt-4 mb-1 font-semibold text-xl">
                Create a {APP_NAME} Account
              </h1>
              <p className="text-sm">
                Welcome! Create an account to get started
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                disabled={isLoading}
                onClick={() => handleSocialSignIn("google")}
                type="button"
                variant="outline"
              >
                <svg
                  aria-hidden="true"
                  height="1em"
                  viewBox="0 0 256 262"
                  width="0.98em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Google</title>
                  <path
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    fill="#4285f4"
                  />
                  <path
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    fill="#34a853"
                  />
                  <path
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                    fill="#fbbc05"
                  />
                  <path
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    fill="#eb4335"
                  />
                </svg>
                <span>Google</span>
              </Button>
              <Button
                disabled={isLoading}
                onClick={() => handleSocialSignIn("microsoft")}
                type="button"
                variant="outline"
              >
                <svg
                  aria-hidden="true"
                  height="1em"
                  viewBox="0 0 256 256"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Microsoft</title>
                  <path d="M121.666 121.666H0V0h121.666z" fill="#f1511b" />
                  <path d="M256 121.666H134.335V0H256z" fill="#80cc28" />
                  <path
                    d="M121.663 256.002H0V134.336h121.663z"
                    fill="#00adef"
                  />
                  <path d="M256 256.002H134.335V134.336H256z" fill="#fbbc09" />
                </svg>
                <span>Microsoft</span>
              </Button>
            </div>

            <hr className="my-4 border-dashed" />

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <signUpForm.Field name="firstName">
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="block text-sm" htmlFor={field.name}>
                        First name
                      </Label>
                      <Input
                        autoComplete="given-name"
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
                </signUpForm.Field>
                <signUpForm.Field name="lastName">
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="block text-sm" htmlFor={field.name}>
                        Last name
                      </Label>
                      <Input
                        autoComplete="family-name"
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
                </signUpForm.Field>
              </div>

              <signUpForm.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="block text-sm" htmlFor={field.name}>
                      Email
                    </Label>
                    <Input
                      autoComplete="email"
                      disabled={isLoading}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="email"
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
              </signUpForm.Field>

              <signUpForm.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-sm" htmlFor={field.name}>
                      Password
                    </Label>
                    <Input
                      autoComplete="new-password"
                      disabled={isLoading}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="password"
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
              </signUpForm.Field>

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
            </div>
          </div>

          <div className="rounded-[calc(var(--radius))] border bg-muted p-3">
            <p className="text-center text-accent-foreground text-sm">
              Have an account?{" "}
              <Button
                className="px-2"
                disabled={isLoading}
                onClick={() => setMode("signin")}
                type="button"
                variant="link"
              >
                Sign In
              </Button>
            </p>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen bg-black px-4 py-16 md:py-32">
      <form
        className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          signInForm.handleSubmit();
        }}
      >
        <div className="p-8 pb-6">
          <div>
            <a aria-label="go home" href="/">
              <GalleryVerticalEnd />
            </a>
            <h1 className="mt-4 mb-1 font-semibold text-xl">
              Sign In to {APP_NAME}
            </h1>
            <p className="text-sm">Welcome back! Sign in to continue</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              disabled={isLoading}
              onClick={() => handleSocialSignIn("google")}
              type="button"
              variant="outline"
            >
              <svg
                aria-hidden="true"
                height="1em"
                viewBox="0 0 256 262"
                width="0.98em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Google</title>
                <path
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                  fill="#4285f4"
                />
                <path
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                  fill="#34a853"
                />
                <path
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                  fill="#fbbc05"
                />
                <path
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                  fill="#eb4335"
                />
              </svg>
              <span>Google</span>
            </Button>
            <Button
              disabled={isLoading}
              onClick={() => handleSocialSignIn("microsoft")}
              type="button"
              variant="outline"
            >
              <svg
                aria-hidden="true"
                height="1em"
                viewBox="0 0 256 256"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Microsoft</title>
                <path d="M121.666 121.666H0V0h121.666z" fill="#f1511b" />
                <path d="M256 121.666H134.335V0H256z" fill="#80cc28" />
                <path d="M121.663 256.002H0V134.336h121.663z" fill="#00adef" />
                <path d="M256 256.002H134.335V134.336H256z" fill="#fbbc09" />
              </svg>
              <span>Microsoft</span>
            </Button>
          </div>

          <hr className="my-4 border-dashed" />

          <div className="space-y-6">
            <signInForm.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label className="block text-sm" htmlFor={field.name}>
                    Email
                  </Label>
                  <Input
                    autoComplete="email"
                    disabled={isLoading}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="email"
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
                  <Input
                    autoComplete="current-password"
                    disabled={isLoading}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
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
          </div>
        </div>

        <div className="rounded-[calc(var(--radius))] border bg-muted p-3">
          <p className="text-center text-accent-foreground text-sm">
            Don't have an account?{" "}
            <Button
              className="px-2"
              disabled={isLoading}
              onClick={() => setMode("signup")}
              type="button"
              variant="link"
            >
              Create account
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
