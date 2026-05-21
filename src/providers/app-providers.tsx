"use client";

import { ReactNode } from "react";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthInitializer } from "@/components/auth/auth-initializer";
import { GuestTeamSyncPrompt } from "@/components/auth/guest-team-sync-prompt";
import { ToastProvider } from "@/providers/toast-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <AuthInitializer />
          {children}
          <GuestTeamSyncPrompt />
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
