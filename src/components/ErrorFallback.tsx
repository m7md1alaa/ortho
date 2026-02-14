import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h1 className="mb-2 font-bold text-2xl text-zinc-100">
          Something went wrong
        </h1>
        <p className="mb-6 text-zinc-400">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button className="mx-auto" onClick={resetError} variant="secondary">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
