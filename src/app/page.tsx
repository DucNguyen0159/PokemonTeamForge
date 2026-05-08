import Link from "next/link";
import { BookOpen, LayoutGrid, Sparkles } from "lucide-react";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10">
      <section className="space-y-4 text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          PokemonTeamForge
        </p>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-[32px] sm:leading-tight">
          Build teams, analyze coverage, and share strategies
        </h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          A fast, dashboard-style workspace for casual and intermediate team builders. Core
          features ship incrementally; this is a lightweight landing hub for now.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/builder">
              <LayoutGrid className="size-4" aria-hidden />
              Build Team
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="rounded-xl">
            <Link href="/pokedex">
              <BookOpen className="size-4" aria-hidden />
              Browse Pokédex
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl border-border/60">
            <Link href="/strategies">
              <Sparkles className="size-4" aria-hidden />
              Explore Strategies
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Team Builder",
            blurb: "Singles, doubles, and triples in one reactive workspace.",
          },
          {
            title: "Analysis",
            blurb: "Coverage, checklist, and recommendations update as you edit.",
          },
          {
            title: "Share",
            blurb: "Import/export and team cards for showing off your squad.",
          },
        ].map((item) => (
          <Card
            key={item.title}
            className="rounded-2xl border-border/60 bg-secondary/30 shadow-md"
          >
            <CardContent className="space-y-2 p-5">
              <h2 className="text-base font-medium text-foreground">{item.title}</h2>
              <p className="text-sm text-muted-foreground">{item.blurb}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <PlaceholderPage
        eyebrow="Status"
        title="Foundation phase"
        description="Route shells and layout scaffolding are in place. Full builder, data, and analysis systems will connect here in later phases."
      />
    </div>
  );
}
