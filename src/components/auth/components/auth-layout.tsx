import { GalleryVerticalEnd } from "lucide-react";
import type { ReactNode } from "react";
import { GoogleSignInButton } from "./google-sign-in-button";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  showGoogleButton?: boolean;
  onGoogleSignIn?: () => void;
  isLoading?: boolean;
}

export function AuthLayout({
  title,
  description,
  children,
  footer,
  showGoogleButton = true,
  onGoogleSignIn,
}: AuthLayoutProps) {
  return (
    <section className="flex min-h-screen bg-black px-4 py-16 md:py-32">
      <div className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
        <div className="p-8 pb-6">
          <div>
            <a aria-label="go home" href="/">
              <GalleryVerticalEnd />
            </a>
            <h1 className="mt-4 mb-1 font-semibold text-xl">{title}</h1>
            <p className="text-sm">{description}</p>
          </div>

          {showGoogleButton && onGoogleSignIn && (
            <>
              <div className="mt-6">
                <GoogleSignInButton onClick={onGoogleSignIn} />
              </div>

              <hr className="my-4 border-dashed" />
            </>
          )}

          {children}
        </div>

        {footer && (
          <div className="rounded-[calc(var(--radius))] border bg-muted p-3">
            {footer}
          </div>
        )}
      </div>
    </section>
  );
}
