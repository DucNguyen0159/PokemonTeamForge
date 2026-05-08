"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/profile");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("Please enter both email and password.");
      return;
    }

    const result = await login({ email, password });
    if (!result.success) {
      setFormError(result.message ?? "Unable to sign in. Please try again.");
      return;
    }

    router.push("/profile");
  }

  return (
    <PlaceholderPage
      eyebrow="Account"
      title="Sign in"
      description="Log in to sync teams with Supabase. Guest mode remains available for builder, recommendations, analysis, and import/export."
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Your password"
          />
        </label>

        {(formError || authError) && (
          <ErrorMessage
            title="Sign in failed"
            message={formError ?? authError ?? "Unable to sign in right now."}
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" className="rounded-xl" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link href="/register">Need an account? Register</Link>
          </Button>
        </div>
      </form>
    </PlaceholderPage>
  );
}
