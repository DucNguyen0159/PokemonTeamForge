import { Suspense } from "react";

import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";
import { AuthPageFallback } from "@/components/auth/auth-page-fallback";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthPageFallback
          title="Choose a new password"
          description="Confirming your reset link..."
        />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
