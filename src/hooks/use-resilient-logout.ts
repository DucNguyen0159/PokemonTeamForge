"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { getLogoutButtonLabel } from "@/lib/auth/auth-utils";
import { USER_TEAMS_QUERY_KEY } from "@/hooks/queries/use-user-teams";
import { useAuthStore } from "@/store/auth-store";

export function useResilientLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const isLogoutInFlight = useAuthStore((state) => state.isLogoutInFlight);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const runLogout = useCallback(async () => {
    if (isLoggingOut || isAuthLoading || isLogoutInFlight) {
      return;
    }

    setIsLoggingOut(true);
    setMessage(null);

    try {
      await queryClient.cancelQueries({ queryKey: USER_TEAMS_QUERY_KEY });
      const result = await logout();

      queryClient.removeQueries({ queryKey: USER_TEAMS_QUERY_KEY });

      if (result.message) {
        setMessage(result.message);
      }

      router.replace("/");
      router.refresh();
    } catch {
      setMessage("Signed out locally. Refresh the page if the header does not update.");
      queryClient.removeQueries({ queryKey: USER_TEAMS_QUERY_KEY });
      router.replace("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }, [isAuthLoading, isLoggingOut, isLogoutInFlight, logout, queryClient, router]);

  const isBusy = isLoggingOut || isAuthLoading || isLogoutInFlight;
  const logoutButtonLabel = getLogoutButtonLabel({
    isLoggingOut: isLoggingOut || isAuthLoading,
    isLogoutInFlight,
  });

  return {
    isLoggingOut: isBusy,
    isFinishingSignOut: isLogoutInFlight && !isLoggingOut && !isAuthLoading,
    logoutButtonLabel,
    logoutMessage: message,
    runLogout,
  };
}
