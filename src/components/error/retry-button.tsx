"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type RetryButtonProps = {
  onRetry: () => void;
  isLoading?: boolean;
  label?: string;
  className?: string;
};

export function RetryButton({
  onRetry,
  isLoading = false,
  label = "Try again",
  className,
}: RetryButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={className}
      onClick={onRetry}
      disabled={isLoading}
    >
      <RefreshCw className={isLoading ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden />
      {isLoading ? "Retrying..." : label}
    </Button>
  );
}
