"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  currentAuthRedirectTarget,
  isPasswordRecoveryLocation,
} from "@/lib/auth/auth-utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toFriendlySupabaseMessage } from "@/lib/supabase/errors";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function completeAuthCallback() {
      const supabase = getSupabaseBrowserClient();
      let passwordRecovery = isPasswordRecoveryLocation(window.location);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          passwordRecovery = true;
        }
      });

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (!cancelled) {
              setErrorMessage(
                toFriendlySupabaseMessage(
                  error,
                  "Unable to confirm this link. Request a new password reset or sign in again.",
                ),
              );
            }
            return;
          }
        }

        // PKCE recovery links often omit type=recovery; Supabase emits PASSWORD_RECOVERY instead.
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 0);
        });

        if (cancelled) {
          return;
        }

        if (passwordRecovery || isPasswordRecoveryLocation(window.location)) {
          router.replace("/reset-password");
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          if (!cancelled) {
            setErrorMessage(
              toFriendlySupabaseMessage(
                sessionError,
                "Unable to confirm this link. Request a new password reset or sign in again.",
              ),
            );
          }
          return;
        }

        if (cancelled) {
          return;
        }

        if (session) {
          router.replace(currentAuthRedirectTarget());
          return;
        }

        router.replace("/login");
      } finally {
        subscription.unsubscribe();
      }
    }

    void completeAuthCallback();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
      {errorMessage ? (
        <>
          <p className="text-sm font-medium text-foreground">Link could not be confirmed</p>
          <p className="max-w-md text-sm text-muted-foreground">{errorMessage}</p>
        </>
      ) : (
        <>
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">Confirming your link...</p>
        </>
      )}
    </div>
  );
}
