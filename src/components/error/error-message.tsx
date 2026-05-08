"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/utils";
import { RetryButton } from "./retry-button";

type ErrorMessageProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
};

export function ErrorMessage({
  message,
  title = "Something went wrong",
  onRetry,
  isRetrying = false,
  className,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p>{message}</p>
          {onRetry ? (
            <div className="pt-1">
              <RetryButton onRetry={onRetry} isLoading={isRetrying} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
