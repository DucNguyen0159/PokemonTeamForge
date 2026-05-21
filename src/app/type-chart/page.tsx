import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/layout/page-intro";
import { TypeChartMatrix } from "@/components/type-chart/type-chart-matrix";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Type Chart — PokemonTeamForge",
  description:
    "Gen 6+ Pokémon type matchup chart. See super-effective, resisted, and immune interactions for team building.",
};

export default function TypeChartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageIntro
        eyebrow="Reference"
        title="Type chart"
        description="Read down the left for the attacking type and across the top for the defending type. Use this while planning coverage in Builder or browsing the Pokédex."
        actions={
          <Button asChild variant="secondary" size="sm" className="rounded-xl">
            <Link href="/builder">Open Builder</Link>
          </Button>
        }
      />

      <TypeChartMatrix />
    </main>
  );
}
