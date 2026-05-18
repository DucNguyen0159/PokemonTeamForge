"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { USER_TEAMS_QUERY_KEY } from "@/hooks/queries/use-user-teams";
import { useAuthStore } from "@/store/auth-store";

export function useResilientLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const runLogout = useCallback(async () => {
    if (isLoggingOut || isAuthLoading) {
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
  }, [isAuthLoading, isLoggingOut, logout, queryClient, router]);

  return {
    isLoggingOut: isLoggingOut || isAuthLoading,
    logoutMessage: message,
    runLogout,
  };
}
