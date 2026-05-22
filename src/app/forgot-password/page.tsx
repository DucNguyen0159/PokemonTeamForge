import { Suspense } from "react";

import { AuthPageFallback } from "@/components/auth/auth-page-fallback";
import { ForgotPasswordForm } from "@/app/forgot-password/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthPageFallback
          title="Reset your password"
          description="Enter your account email and we will send a link to choose a new password."
        />
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
