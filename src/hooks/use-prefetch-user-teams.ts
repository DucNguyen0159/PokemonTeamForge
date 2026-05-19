"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  prefetchUserTeams,
} from "@/hooks/queries/user-teams-query";
import { selectIsSessionReady } from "@/lib/auth/session-ready";
import { useAuthStore } from "@/store/auth-store";

export function usePrefetchUserTeams() {
  const queryClient = useQueryClient();
  const isSessionReady = useAuthStore(selectIsSessionReady);
  const userId = useAuthStore((state) => state.user?.id ?? null);

  useEffect(() => {
    if (!isSessionReady || !userId) {
      return;
    }

    void prefetchUserTeams(queryClient, userId);
  }, [isSessionReady, queryClient, userId]);
}
