import Link from "next/link";

import { PokemonFormKindPill } from "@/components/pokemon/pokemon-form-kind-pill";
import {
  classifyPokemonFormFromSlug,
  type AlternateForm,
  type AlternateFormsByKind,
  type PokemonFormKind,
} from "@/lib/pokemon/pokemon-forms";
import { buildPokemonDetailHref } from "@/lib/pokemon/pokemon-detail-query";
import type { PokemonType } from "@/types/shared";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { cn } from "@/utils";

type AlternateFormCard = AlternateForm & {
  isCurrent?: boolean;
};

type PokemonAlternateFormsProps = {
  currentSlug: string;
  currentName: string;
  currentFormKind?: PokemonFormKind;
  currentPrimaryType: PokemonType;
  currentSecondaryType?: PokemonType | null;
  currentSprite: string;
  currentTotal: number;
  alternateForms?: AlternateForm[];
  alternateFormsByKind?: AlternateFormsByKind;
  detailQuery?: Record<string, string | string[] | null | undefined>;
};

function toCurrentAlternateFormCard(
  props: Pick<
    PokemonAlternateFormsProps,
    | "currentSlug"
    | "currentName"
    | "currentFormKind"
    | "currentPrimaryType"
    | "currentSecondaryType"
    | "currentSprite"
    | "currentTotal"
  >,
): AlternateFormCard {
  const classified = classifyPokemonFormFromSlug(props.currentSlug);

  return {
    formKind: props.currentFormKind ?? classified.formKind,
    slug: props.currentSlug,
    name: props.currentName,
    primaryType: props.currentPrimaryType,
    secondaryType: props.currentSecondaryType,
    total: props.currentTotal,
    spriteNormal: props.currentSprite,
    pokedexDisplayNo: 0,
    listSortRank: 0,
    isCurrent: true,
  };
}

function buildAlternateForms(props: PokemonAlternateFormsProps): AlternateFormCard[] {
  const {
    currentSlug,
    currentFormKind,
    alternateForms = [],
    alternateFormsByKind,
  } = props;

  const normalizedCurrent = currentSlug.trim().toLowerCase();
  const siblingForms = alternateForms.filter((form) => form.slug !== normalizedCurrent);
  const currentForm =
    currentFormKind && currentFormKind !== "default"
      ? toCurrentAlternateFormCard(props)
      : null;

  const megaForms = [
    ...(alternateFormsByKind?.mega ?? siblingForms.filter((form) => form.formKind === "mega")),
    ...(currentForm?.formKind === "mega" ? [currentForm] : []),
  ].filter(
    (form, index, list) => list.findIndex((entry) => entry.slug === form.slug) === index,
  );

  const gigantamaxForms = [
    ...(alternateFormsByKind?.gigantamax ??
      siblingForms.filter((form) => form.formKind === "gigantamax")),
    ...(currentForm?.formKind === "gigantamax" ? [currentForm] : []),
  ].filter(
    (form, index, list) => list.findIndex((entry) => entry.slug === form.slug) === index,
  );

  const regionalAndOtherForms = [
    ...(alternateFormsByKind?.regional ?? siblingForms.filter((form) => form.formKind === "regional")),
    ...(alternateFormsByKind?.other ?? siblingForms.filter((form) => form.formKind === "other")),
    ...(currentForm?.formKind === "regional" || currentForm?.formKind === "other"
      ? [currentForm]
      : []),
  ].filter(
    (form, index, list) => list.findIndex((entry) => entry.slug === form.slug) === index,
  );

  return [...megaForms, ...gigantamaxForms, ...regionalAndOtherForms];
}

type AlternateFormCardProps = {
  form: AlternateFormCard;
  currentSlug: string;
  detailQuery?: Record<string, string | string[] | null | undefined>;
};

function AlternateFormCardLink({ form, currentSlug, detailQuery }: AlternateFormCardProps) {
  const isCurrent = form.isCurrent || form.slug === currentSlug.trim().toLowerCase();
  const href = buildPokemonDetailHref(form.slug, detailQuery);

  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-[8.5rem] max-w-[10rem] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border px-2.5 py-3 transition-colors sm:min-w-[9.5rem] sm:px-3",
        "hover:border-primary/40 hover:bg-background/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isCurrent
          ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30"
          : "border-border/50 bg-background/35",
      )}
    >
      <div className="flex min-h-[1.35rem] items-center justify-center gap-1">
        {isCurrent ? (
          <span className="rounded-full border border-primary/50 bg-primary/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
            Current
          </span>
        ) : null}
        <PokemonFormKindPill formKind={form.formKind} className="px-2 py-0.5 text-[10px]" />
      </div>
      <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted/40">
        <PokemonSprite
          src={form.spriteNormal}
          alt={form.name}
          size={64}
          className="h-full w-full object-contain p-1"
        />
      </div>
      <div className="text-center">
        <p className={cn("text-sm font-semibold", isCurrent ? "text-primary" : "text-foreground")}>
          {form.name}
        </p>
        <p className="text-[11px] text-muted-foreground">BST {form.total}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        <TypeBadge type={form.primaryType} />
        {form.secondaryType ? <TypeBadge type={form.secondaryType} /> : null}
      </div>
    </Link>
  );
}

export function PokemonAlternateForms(props: PokemonAlternateFormsProps) {
  const forms = buildAlternateForms(props);

  if (forms.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-semibold text-foreground">Alternate forms</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Mega, Gigantamax, and regional variants for this species. Evolution stays in the chain above.
      </p>

      <div className="mt-5 flex snap-x gap-3 overflow-x-auto pb-1 [scroll-padding-inline:0.25rem] [-ms-overflow-style:none] [scrollbar-width:thin]">
        {forms.map((form) => (
          <AlternateFormCardLink
            key={form.slug}
            form={form}
            currentSlug={props.currentSlug}
            detailQuery={props.detailQuery}
          />
        ))}
      </div>
    </section>
  );
}

export function hasAlternateFormsSection(
  alternateForms: AlternateForm[] | undefined,
  alternateFormsByKind: AlternateFormsByKind | undefined,
): boolean {
  if ((alternateForms?.length ?? 0) > 0) {
    return true;
  }

  if (!alternateFormsByKind) {
    return false;
  }

  return Object.values(alternateFormsByKind).some((forms) => (forms?.length ?? 0) > 0);
}
