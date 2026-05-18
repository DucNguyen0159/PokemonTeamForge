import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  CreditCard,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Swords,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HOME_PREVIEW_GROUPS,
  PREVIEW_POKEMON_BY_SLUG,
  type PreviewPokemon,
} from "@/data/preview-pokemon";
import { STRATEGY_TEAM_PRESETS } from "@/data/strategy-teams";
import type { PokemonType } from "@/types/shared";

export const metadata: Metadata = {
  title: "PokemonTeamForge | Build Smarter Pokémon Teams",
  description:
    "Create Pokémon teams, analyze type coverage, browse battle-ready data, explore strategy presets, and export shareable team cards.",
  openGraph: {
    title: "PokemonTeamForge | Build Smarter Pokémon Teams",
    description:
      "Plan teams, analyze coverage, browse battle-ready Pokémon data, explore strategy presets, and export polished team cards.",
    type: "website",
    siteName: "PokemonTeamForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "PokemonTeamForge | Build Smarter Pokémon Teams",
    description:
      "Build Pokémon teams, analyze coverage, explore strategies, and export shareable team cards.",
  },
};

const HOME_STATS = [
  {
    value: "1,350+",
    label: "Pokémon",
    description: "Battle-ready Pokédex entries",
  },
  {
    value: "2,000+",
    label: "Items",
    description: "Held items, battle items, and catalog data",
  },
  {
    value: `${STRATEGY_TEAM_PRESETS.length}`,
    label: "Strategy Presets",
    description: "Curated archetypes across formats",
  },
  {
    value: "3",
    label: "Battle Formats",
    description: "Singles, Doubles, and Triples",
  },
] as const;

const FEATURE_SECTIONS = [
  {
    title: "Team Builder",
    eyebrow: "Build",
    description:
      "Create Singles, Doubles, or Triples teams with the core choices in one reactive workspace.",
    href: "/builder",
    cta: "Start Building",
    icon: Swords,
    preview: "builder",
  },
  {
    title: "Coverage Analysis",
    eyebrow: "Analyze",
    description:
      "Type coverage, role balance, and team checklist signals update while you make changes, so weak spots are easier to catch early.",
    href: "/builder",
    cta: "Analyze Team",
    icon: BarChart3,
    preview: "coverage",
  },
  {
    title: "Battle-Ready Pokédex",
    eyebrow: "Browse",
    description:
      "The Pokédex focuses on stats, typing, abilities, moves, items, and filters that help with team decisions.",
    href: "/pokedex",
    cta: "Browse Data",
    icon: ShieldCheck,
    preview: "pokedex",
  },
  {
    title: "Strategy Presets",
    eyebrow: "Plan",
    description:
      "Explore curated team archetypes when you want a proven starting point or a new battle style.",
    href: "/strategies",
    cta: "Explore Presets",
    icon: Sparkles,
    preview: "strategies",
  },
  {
    title: "Team Cards",
    eyebrow: "Share",
    description:
      "When the team is ready, export a custom Team Card with trainer art, background themes, and polished presentation controls.",
    href: "/team-card",
    cta: "Create Card",
    icon: Boxes,
    preview: "cards",
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Build",
    text: "Add Pokémon, abilities, items, and moves in the team workspace.",
  },
  {
    step: "02",
    title: "Analyze",
    text: "Review type coverage, format checklist guidance, and team balance.",
  },
  {
    step: "03",
    title: "Improve",
    text: "Use recommendations, Pokédex filters, and strategy presets to refine the roster.",
  },
  {
    step: "04",
    title: "Share",
    text: "Export a clean Team Card when your squad is ready to show.",
  },
] as const;

const TYPE_BADGE_STYLES: Record<PokemonType, string> = {
  normal: "border-stone-300/25 bg-stone-300/15 text-stone-100",
  fire: "border-orange-400/30 bg-orange-500/15 text-orange-100",
  water: "border-sky-400/30 bg-sky-500/15 text-sky-100",
  electric: "border-yellow-300/30 bg-yellow-400/15 text-yellow-100",
  grass: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  ice: "border-cyan-300/30 bg-cyan-400/15 text-cyan-100",
  fighting: "border-red-400/30 bg-red-500/15 text-red-100",
  poison: "border-purple-400/30 bg-purple-500/15 text-purple-100",
  ground: "border-amber-400/30 bg-amber-600/15 text-amber-100",
  flying: "border-indigo-300/30 bg-indigo-400/15 text-indigo-100",
  psychic: "border-pink-400/30 bg-pink-500/15 text-pink-100",
  bug: "border-lime-400/30 bg-lime-500/15 text-lime-100",
  rock: "border-yellow-600/30 bg-yellow-700/15 text-yellow-100",
  ghost: "border-violet-400/30 bg-violet-500/15 text-violet-100",
  dragon: "border-indigo-500/30 bg-indigo-600/15 text-indigo-100",
  dark: "border-slate-300/25 bg-slate-500/15 text-slate-100",
  steel: "border-slate-200/30 bg-slate-300/15 text-slate-100",
  fairy: "border-fuchsia-300/30 bg-fuchsia-400/15 text-fuchsia-100",
};

const HOME_PREVIEW_TRAINER_PATH = "/team-card/trainers/masters/spr-masters-caitlin-fall-2021.png";
const HOME_PREVIEW_CARD_BACKGROUND = "/team-card/backgrounds/cosmic-arena-2.png";

function titleCaseType(type: PokemonType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function pokemonFromSlug(slug: string): PreviewPokemon {
  const pokemon = PREVIEW_POKEMON_BY_SLUG.get(slug);
  if (!pokemon) {
    throw new Error(`Missing Home preview Pokémon data for ${slug}`);
  }
  return pokemon;
}

function pokemonGroup(slugs: readonly string[]): PreviewPokemon[] {
  return slugs.map((slug) => pokemonFromSlug(slug));
}

function pokemonTypes(pokemon: PreviewPokemon): PokemonType[] {
  return pokemon.types.filter((type): type is PokemonType => Boolean(type));
}

function TypeBadge({ type, className = "" }: { type: PokemonType; className?: string }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${TYPE_BADGE_STYLES[type]} ${className}`}
    >
      {titleCaseType(type)}
    </span>
  );
}

function PokemonSprite({
  pokemon,
  size = 42,
  className = "",
}: {
  pokemon: PreviewPokemon;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-background/15 ring-1 ring-white/15 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={pokemon.spritePath}
        alt={pokemon.name}
        fill
        className="scale-[1.18] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]"
        sizes={`${size}px`}
      />
    </span>
  );
}

function HeroProductPreview() {
  const heroTeam = pokemonGroup(HOME_PREVIEW_GROUPS.heroTeam);
  const exportTeam = pokemonGroup(HOME_PREVIEW_GROUPS.teamCardTeam);

  return (
    <div className="rounded-3xl border border-white/10 bg-background/45 p-3 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/75">
        <div className="flex items-center justify-between border-b border-border/45 bg-background/35 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Live Team Workspace
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">Bulky Offense Core</p>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
            6/6 Ready
          </span>
        </div>

        <div className="grid gap-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            {heroTeam.map((pokemon) => (
              <div
                key={pokemon.slug}
                className="rounded-2xl border border-border/45 bg-background/50 p-2.5 text-center shadow-sm"
              >
                <PokemonSprite pokemon={pokemon} size={42} className="mx-auto mb-1.5" />
                <p className="truncate text-[10px] font-semibold text-foreground">{pokemon.name}</p>
                <p className="mt-0.5 truncate text-[9px] capitalize text-muted-foreground">
                  {pokemon.role}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/45 bg-background/45 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Coverage</p>
                <Activity className="size-3.5 text-emerald-300" aria-hidden />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["fire", "steel", "dragon", "fairy"] as const).map((type) => (
                  <TypeBadge key={type} type={type} />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/45 bg-background/45 p-3">
              <p className="text-xs font-semibold text-foreground">Export Preview</p>
              <div
                className="mt-2 overflow-hidden rounded-xl border border-primary/25 bg-cover bg-center p-2"
                style={{ backgroundImage: `linear-gradient(90deg, rgba(3,7,18,0.72), rgba(15,23,42,0.2)), url(${HOME_PREVIEW_CARD_BACKGROUND})` }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <div className="h-1.5 w-20 rounded-full bg-white/55" />
                    <div className="mt-1 h-1 w-12 rounded-full bg-white/30" />
                  </div>
                  <span className="rounded-full border border-white/15 px-1.5 py-0.5 text-[8px] text-white/65">
                    Card
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {exportTeam.map((pokemon) => (
                    <PokemonSprite key={pokemon.slug} pokemon={pokemon} size={22} className="mx-auto" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuilderMiniPreview() {
  const builderTeam = pokemonGroup(HOME_PREVIEW_GROUPS.builderTeam);

  return (
    <div className="rounded-2xl border border-border/45 bg-background/40 p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
          Singles
        </span>
        <span className="text-[10px] text-muted-foreground">Team slots</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {builderTeam.map((pokemon) => (
          <div key={pokemon.slug} className="rounded-xl border border-border/40 bg-card/45 p-2">
            <div className="flex items-center gap-2">
              <PokemonSprite pokemon={pokemon} size={30} className="shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-foreground">{pokemon.name}</p>
                <p className="truncate text-[9px] capitalize text-muted-foreground">{pokemon.role}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {pokemonTypes(pokemon).map((type) => (
                <TypeBadge key={type} type={type} className="px-1.5 text-[8px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoverageMiniPreview() {
  return (
    <div className="rounded-2xl border border-border/45 bg-background/40 p-3">
      <div className="mb-3 grid grid-cols-4 gap-1.5">
        {["Fire", "Water", "Ground", "Fairy"].map((type) => (
          <span
            key={type}
            className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-center text-[10px] text-emerald-200"
          >
            {type}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        {[82, 66, 54].map((width, index) => (
          <div key={width} className="flex items-center gap-2">
            <span className="w-14 text-[10px] text-muted-foreground">
              {["Resists", "Checks", "Pressure"][index]}
            </span>
            <span className="h-2 flex-1 rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-emerald-400/70 to-cyan-300/60"
                style={{ width: `${width}%` }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PokedexMiniPreview() {
  const pokedexHighlights = pokemonGroup(HOME_PREVIEW_GROUPS.pokedexHighlights);

  return (
    <div className="rounded-2xl border border-border/45 bg-background/40 p-3">
      <div className="mb-3 rounded-xl border border-border/40 bg-card/50 px-3 py-2 text-[10px] text-muted-foreground">
        Search Dragon, filter by type, sort by Speed
      </div>
      <div className="space-y-2">
        {pokedexHighlights.map((pokemon) => (
          <div key={pokemon.slug} className="flex items-center gap-2 rounded-xl bg-card/35 p-2">
            <PokemonSprite pokemon={pokemon} size={32} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-foreground">{pokemon.name}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {pokemonTypes(pokemon).map((type) => (
                  <TypeBadge key={type} type={type} className="px-1.5 text-[8px]" />
                ))}
              </div>
            </div>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
              #{pokemon.nationalNumber}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrategiesMiniPreview() {
  return (
    <div className="rounded-2xl border border-border/45 bg-background/40 p-3">
      <div className="grid gap-2">
        {HOME_PREVIEW_GROUPS.strategyPresets.map((preset) => (
          <div key={preset.name} className="rounded-xl border border-border/40 bg-card/40 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-foreground">{preset.name}</p>
              <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] text-violet-200">
                {preset.format}
              </span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {pokemonGroup(preset.pokemonSlugs).map((pokemon) => (
                <PokemonSprite key={pokemon.slug} pokemon={pokemon} size={20} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamCardMiniPreview() {
  const teamCardTeam = pokemonGroup(HOME_PREVIEW_GROUPS.teamCardTeam);

  return (
    <div
      className="rounded-2xl border border-primary/25 bg-cover bg-center p-3"
      style={{ backgroundImage: `linear-gradient(90deg, rgba(3,7,18,0.82), rgba(15,23,42,0.24)), url(${HOME_PREVIEW_CARD_BACKGROUND})` }}
    >
      <div className="rounded-xl border border-white/10 bg-black/20 p-3 shadow-xl shadow-black/20">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/45">
              Trainer Card
            </p>
            <p className="mt-1 text-[13px] font-black uppercase tracking-wide text-white">
              Sephora
            </p>
            <p className="text-[9px] font-semibold text-white/70">Bulky Offense Core</p>
          </div>
          <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] text-white/60">
            Team Card
          </span>
        </div>
        <div className="grid grid-cols-[1fr_58px] gap-3">
          <div className="grid grid-cols-3 gap-1.5">
            {teamCardTeam.map((pokemon) => (
              <span
                key={pokemon.slug}
                className="relative flex aspect-square items-center justify-center rounded-full bg-white/18 ring-1 ring-white/18"
              >
                <Image
                  src={pokemon.spritePath}
                  alt={pokemon.name}
                  fill
                  className="scale-[1.18] object-contain drop-shadow-[0_3px_7px_rgba(0,0,0,0.55)]"
                  sizes="30px"
                />
              </span>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-full bg-gradient-to-b from-pink-200/70 to-pink-500/20 ring-1 ring-white/15">
            <Image
              src={HOME_PREVIEW_TRAINER_PATH}
              alt="Trainer preview"
              width={80}
              height={110}
              className="absolute left-1/2 top-1 h-full w-[250%] -translate-x-1/2 object-contain object-top drop-shadow-[0_5px_10px_rgba(0,0,0,0.55)]"
              sizes="58px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturePreview({ kind }: { kind: (typeof FEATURE_SECTIONS)[number]["preview"] }) {
  if (kind === "builder") {
    return <BuilderMiniPreview />;
  }
  if (kind === "coverage") {
    return <CoverageMiniPreview />;
  }
  if (kind === "pokedex") {
    return <PokedexMiniPreview />;
  }
  if (kind === "strategies") {
    return <StrategiesMiniPreview />;
  }
  return <TeamCardMiniPreview />;
}

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:space-y-14 sm:py-10 lg:px-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/60 p-5 shadow-2xl shadow-black/10 sm:p-8 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(125,211,252,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.14),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.18),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:36px_36px] opacity-55"
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              PokemonTeamForge
            </p>
            <div className="space-y-3">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Build Smarter Pokémon Teams
              </h1>
              <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                Plan teams, analyze type coverage, browse battle-ready Pokémon, explore strategy
                presets, and export polished team cards from one focused workspace.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/builder">
                  <LayoutGrid className="size-4" aria-hidden />
                  Start Building
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-xl">
                <Link href="/pokedex">
                  <BookOpen className="size-4" aria-hidden />
                  Browse Pokédex
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl border-border/60">
                <Link href="/team-card">
                  <CreditCard className="size-4" aria-hidden />
                  Create Team Card
                </Link>
              </Button>
            </div>
            <div className="grid gap-2 pt-3 sm:grid-cols-2 lg:grid-cols-4">
              {HOME_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/50 bg-background/35 p-3 backdrop-blur"
                >
                  <p className="text-xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <HeroProductPreview />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Feature Showcase
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              One workspace for building, checking, planning, and sharing
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Jump into the tool you need, then move through the full team workflow without losing
            context.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          {FEATURE_SECTIONS.map((item, index) => {
            const Icon = item.icon;
            const isPrimary = index < 2;
            return (
              <Card
                key={item.title}
                className={`group overflow-hidden rounded-2xl border-border/60 bg-secondary/20 shadow-md transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-xl hover:shadow-black/10 ${
                  isPrimary ? "lg:col-span-3" : "lg:col-span-2"
                }`}
              >
                <CardContent className="flex h-full flex-col gap-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-background/55">
                      <Icon className="size-4 text-primary" aria-hidden />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {item.eyebrow}
                      </p>
                      <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    </div>
                  </div>
                  <FeaturePreview kind={item.preview} />
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  <Link
                    href={item.href}
                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary transition group-hover:gap-2"
                  >
                    {item.cta}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/10 p-6 shadow-xl shadow-black/5 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Ready To Forge
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Build {"->"} Analyze {"->"} Improve {"->"} Share
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open the builder, add your first six Pokémon, check the weak points, refine your
              choices, then export a polished team card when the squad is ready.
            </p>
            <div className="grid gap-2 sm:grid-cols-4">
              {WORKFLOW_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-border/45 bg-background/35 p-3"
                >
                  <p className="text-[10px] font-semibold text-primary">{item.step}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row lg:flex-col">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/builder">
                Start Building
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
