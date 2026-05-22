"use client";

import { AuthLayout } from "@/components/auth/auth-layout";

type AuthPageFallbackProps = {
  title: string;
  description: string;
};

export function AuthPageFallback({ title, description }: AuthPageFallbackProps) {
  return (
    <AuthLayout eyebrow="Account" title={title} description={description}>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </AuthLayout>
  );
}
