"use client";

import { useEffect } from "react";
import { ErrorMessage } from "@/components/error/error-message";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Global Error Boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-10">
      <ErrorMessage
        title="Page failed to load"
        message="Please refresh or try again. Your team data is still saved locally."
        onRetry={reset}
      />
    </div>
  );
}
