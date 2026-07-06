"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { saveChampionsLastRoute } from "@/lib/champions/last-route";

const ROUTE_LABELS: Record<string, string> = {
  "/champions": "Dashboard",
  "/champions/builder": "Team Builder",
  "/champions/damage": "Damage Lab",
  "/champions/presets": "Strategy Presets",
  "/champions/plans": "Battle Plans",
  "/champions/coach": "Matchup Coach",
  "/champions/community": "Community Teams",
};

export function ChampionsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname.startsWith("/champions")) {
      return;
    }
    const base = pathname.split("/").slice(0, 3).join("/") || pathname;
    const label = ROUTE_LABELS[base] ?? "Champions";
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    saveChampionsLastRoute(href, label);
  }, [pathname, searchParams]);

  return null;
}
