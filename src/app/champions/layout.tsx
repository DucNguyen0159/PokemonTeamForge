import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { ChampionsRouteTracker } from "@/components/champions/shared/champions-route-tracker";
import {
  ChampionsSubnavDesktop,
  ChampionsSubnavMobile,
} from "@/components/champions/champions-subnav";

export const metadata: Metadata = {
  title: "Champions",
  description:
    "Pokemon Champions workspace for 6-Pokemon teams, 3v3/4v4 battle plans, damage lab, and community teams.",
};

export default function ChampionsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
      <Suspense fallback={null}>
        <ChampionsRouteTracker />
      </Suspense>
      <Suspense fallback={null}>
        <ChampionsSubnavMobile />
      </Suspense>
      <div className="mt-4 flex items-start gap-6">
        <Suspense fallback={null}>
          <ChampionsSubnavDesktop />
        </Suspense>
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}
