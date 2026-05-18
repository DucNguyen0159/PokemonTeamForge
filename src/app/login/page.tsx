"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { AuthLayout, PasswordInput } from "@/components/auth/auth-layout";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { currentAuthRedirectTarget } from "@/lib/auth/auth-utils";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(currentAuthRedirectTarget());
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

    setIsSubmitting(true);
    try {
      const result = await login({ email, password });
      if (!result.success) {
        setFormError(result.message ?? "Unable to sign in. Please try again.");
        return;
      }

      router.push(currentAuthRedirectTarget());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Account"
      title="Welcome back"
      description="Sign in to sync saved teams, builder edits, recommendations, and Team Card exports. Guest mode remains available for core tools."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="email" className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Email</span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-border/60 bg-background/55 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="you@example.com"
          />
        </label>

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="Your password"
        />

        {(formError || authError) && (
          <ErrorMessage
            title="Sign in failed"
            message={formError ?? authError ?? "Unable to sign in right now."}
          />
        )}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <Button type="submit" className="h-10 rounded-xl px-5" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-10 rounded-xl">
            <Link href="/register">Need an account? Create one</Link>
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          You can keep using Builder, Pokédex, Abilities, and recommendations in guest mode.
          Signing in only adds cloud saving and sync.
        </p>
      </form>
    </AuthLayout>
  );
}
