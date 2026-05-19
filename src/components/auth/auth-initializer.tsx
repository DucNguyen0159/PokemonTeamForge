"use client";

import { useEffect } from "react";

import { usePrefetchUserTeams } from "@/hooks/use-prefetch-user-teams";
import { useAuthStore } from "@/store/auth-store";

export function AuthInitializer() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  usePrefetchUserTeams();

  return null;
}
