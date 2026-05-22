import { Suspense } from "react";

import { LoginForm } from "@/app/login/login-form";
import { AuthPageFallback } from "@/components/auth/auth-page-fallback";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthPageFallback
          title="Welcome back"
          description="Sign in to sync saved teams, builder edits, and Team Card exports."
        />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
