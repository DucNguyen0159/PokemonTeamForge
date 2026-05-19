"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

import { PREVIEW_POKEMON_BY_SLUG } from "@/data/preview-pokemon";
import type { PreviewPokemon } from "@/data/preview-pokemon";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { cn } from "@/utils";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder: string;
  helperText?: string;
  disabled?: boolean;
};

const PREVIEW_TEAM = [
  "garchomp",
  "rotom-wash",
  "amoonguss",
  "gholdengo",
]
  .map((slug) => PREVIEW_POKEMON_BY_SLUG.get(slug))
  .filter((pokemon): pokemon is PreviewPokemon => Boolean(pokemon));

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Cloud saved teams",
    text: "Keep your account teams available after refreshes and across sessions.",
  },
  {
    icon: RefreshCw,
    title: "Builder continuity",
    text: "Return to edits, recommendations, and analysis without rebuilding from scratch.",
  },
  {
    icon: Sparkles,
    title: "Share-ready exports",
    text: "Use saved builds as a stable base for polished Team Card exports.",
  },
];

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  helperText,
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div
        className={cn(
          "flex items-center rounded-xl border border-border/60 bg-background/55 transition-colors focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          disabled={disabled}
          className="mr-1.5 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
      {helperText ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground/80">{helperText}</p>
      ) : null}
    </label>
  );
}

function SyncPreviewPanel() {
  return (
    <aside className="relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-primary/10 p-5 shadow-inner lg:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-10 size-44 rounded-full bg-sky-400/10 blur-3xl"
      />

      <div className="relative space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Account Sync
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            Save the team-building work that matters.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Guest tools stay open. Signing in adds a stable place for saved teams,
            edits, and exports.
          </p>
        </div>

        <div className="rounded-2xl border border-border/45 bg-background/45 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Rain Balance</p>
              <p className="text-xs text-muted-foreground">Synced team preview</p>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
              Saved
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {PREVIEW_TEAM.map((pokemon) => (
              <div
                key={pokemon.slug}
                className="flex items-center gap-2 rounded-xl border border-border/35 bg-card/55 p-2"
              >
                <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/35 bg-background/60 ring-1 ring-white/10">
                  <PokemonSprite
                    src={pokemon.spritePath}
                    alt={pokemon.name}
                    size={36}
                    className="h-full w-full object-contain p-1"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {pokemon.name}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {pokemon.role}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex gap-3 rounded-2xl border border-border/35 bg-background/35 p-3"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">{title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {text}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function AuthLayout({ eyebrow, title, description, children }: AuthLayoutProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center px-4 py-8">
      <section className="w-full space-y-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>

        <div className="grid overflow-hidden rounded-[2rem] border border-border/60 bg-card/55 shadow-2xl shadow-black/10 backdrop-blur-sm lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,0.78fr)]">
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="max-w-md">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            <div className="mt-6 max-w-md">{children}</div>
          </div>

          <div className="border-t border-border/60 p-4 sm:p-5 lg:border-l lg:border-t-0">
            <SyncPreviewPanel />
          </div>
        </div>
      </section>
    </main>
  );
}
