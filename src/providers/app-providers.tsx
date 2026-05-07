"use client";

import { ReactNode } from "react";
import { QueryProvider } from "@/providers/query-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
