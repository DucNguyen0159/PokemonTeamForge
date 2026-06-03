/* eslint-disable @next/next/no-img-element */
"use client";

import { forwardRef, memo, useMemo, type CSSProperties } from "react";
import { Inter, Luckiest_Guy, Montserrat } from "next/font/google";

import type {
  TeamCardBackgroundAsset,
  TeamCardIconOption,
  TeamCardTrainerVariant,
} from "@/data/team-card-assets";
import type {
  TeamCardComposition,
  TeamCardDetailRow,
  TeamCardSlotCustomization,
  TeamCardSpriteMode,
  TeamCardVisualStyle,
} from "@/types/team-card";
import type { PokemonType } from "@/types/shared";
import type { TeamPokemon } from "@/types/team";

const teamCardTitleFont = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const teamCardBodyFont = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const trainerSocialStickerFont = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
});

const STICKER_OUTLINE_SHADOW =
  "1px 1px 0 #0a0a0a, -1px -1px 0 #0a0a0a, 1px -1px 0 #0a0a0a, -1px 1px 0 #0a0a0a, 2px 0 0 #0a0a0a, -2px 0 0 #0a0a0a, 0 2px 0 #0a0a0a, 0 -2px 0 #0a0a0a, 2px 2px 0 #0a0a0a, -2px -2px 0 #0a0a0a, 2px -2px 0 #0a0a0a, -2px 2px 0 #0a0a0a";

type TeamCardPreviewProps = {
  teamSlots: TeamPokemon[];
  teamName: string;
  trainerName: string;
  trainerDetails: TeamCardDetailRow[];
  background: TeamCardBackgroundAsset;
  trainer: TeamCardTrainerVariant;
  spriteMode: TeamCardSpriteMode;
  slotCustomizations: TeamCardSlotCustomization[];
  visualStyle: TeamCardVisualStyle;
  composition: TeamCardComposition;
  detailIconOptions: TeamCardIconOption[];
  isMobileLayout?: boolean;
};

const CARD_INSET = "3%";
const SLOT_COUNT = 6;
const EMPTY_SPRITE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='44' fill='%23ffffff12' stroke='%23ffffff22' stroke-width='2'/%3E%3Ccircle cx='48' cy='48' r='18' fill='%23ffffff18'/%3E%3C/svg%3E";
const TRAINER_PLACEHOLDER = "/placeholders/trainer-placeholder.svg";
const POKEMON_PLACEHOLDER = "/placeholders/pokemon-placeholder.svg";

const TYPE_ACCENTS: Record<PokemonType, string> = {
  normal: "#a8a77a",
  fire: "#ee8130",
  water: "#6390f0",
  electric: "#f7d02c",
  grass: "#7ac74c",
  ice: "#96d9d6",
  fighting: "#c22e28",
  poison: "#a33ea1",
  ground: "#e2bf65",
  flying: "#a98ff3",
  psychic: "#f95587",
  bug: "#a6b91a",
  rock: "#b6a136",
  ghost: "#735797",
  dragon: "#6f35fc",
  dark: "#705746",
  steel: "#b7b7ce",
  fairy: "#d685ad",
};

function getOverlayGradient(intensity: TeamCardVisualStyle["overlayIntensity"]): string {
  if (intensity === "low") {
    return "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 52%, rgba(0,0,0,0.18) 100%)";
  }
  if (intensity === "high") {
    return "linear-gradient(90deg, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.25) 52%, rgba(0,0,0,0.42) 100%)";
  }
  return "linear-gradient(90deg, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.14) 52%, rgba(0,0,0,0.28) 100%)";
}

function getSpriteFilter(glow: TeamCardVisualStyle["spriteGlow"], hasPokemon: boolean): string {
  if (!hasPokemon) {
    return "opacity(0.45)";
  }
  if (glow === "off") {
    return "drop-shadow(0 3px 7px rgba(0,0,0,0.42))";
  }
  if (glow === "strong") {
    return "drop-shadow(0 4px 9px rgba(0,0,0,0.55)) drop-shadow(0 0 16px rgba(255,255,255,0.45))";
  }
  return "drop-shadow(0 3px 7px rgba(0,0,0,0.45)) drop-shadow(0 0 9px rgba(255,255,255,0.25))";
}

function getLabelStyle(style: TeamCardVisualStyle["labelStyle"]): CSSProperties {
  if (style === "minimal") {
    return {
      background: "transparent",
      color: "rgba(255,255,255,0.96)",
      borderRadius: 0,
      padding: "0 2px",
      border: "none",
      textShadow: STICKER_OUTLINE_SHADOW,
    };
  }
  if (style === "pill") {
    return {
      background: "rgba(15,23,42,0.76)",
      color: "rgba(255,255,255,0.96)",
      borderRadius: "999px",
      padding: "3px 8px",
      border: "1px solid rgba(255,255,255,0.18)",
      textShadow: "0 1px 2px rgba(0,0,0,0.5)",
    };
  }
  return {
    background: "rgba(248,250,252,0.94)",
    color: "#1f2937",
    borderRadius: "999px",
    padding: "2px 7px",
    border: "1px solid rgba(15,23,42,0.08)",
    textShadow: "none",
  };
}

function getCardBorderStyle(style: TeamCardVisualStyle["borderStyle"]): Pick<CSSProperties, "border" | "boxShadow"> {
  if (style === "none") {
    return {
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 14px 36px rgba(0,0,0,0.38)",
    };
  }
  if (style === "neon") {
    return {
      border: "1px solid rgba(125,211,252,0.55)",
      boxShadow:
        "0 18px 48px rgba(0,0,0,0.45), 0 0 28px rgba(125,211,252,0.22), inset 0 1px 0 rgba(255,255,255,0.16)",
    };
  }
  return {
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 18px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
  };
}

function getPokemonFrameStyle(
  style: TeamCardVisualStyle["pokemonFrameStyle"],
  accent: string,
): CSSProperties {
  if (style === "none") {
    return {
      borderRadius: "24px",
      background: "rgba(15,23,42,0.16)",
      border: "1px solid rgba(255,255,255,0.08)",
    };
  }

  if (style === "type-ring") {
    return {
      borderRadius: "26px",
      background:
        "linear-gradient(145deg, rgba(15,23,42,0.72), rgba(15,23,42,0.26)) padding-box, " +
        `linear-gradient(145deg, ${accent}, rgba(255,255,255,0.55)) border-box`,
      border: "1.5px solid transparent",
      boxShadow: `0 12px 26px rgba(0,0,0,0.28), 0 0 18px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.16)`,
    };
  }

  if (style === "glass-tile") {
    return {
      borderRadius: "18px",
      background: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(15,23,42,0.42))",
      border: "1px solid rgba(255,255,255,0.18)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
    };
  }

  return {
    borderRadius: "999px",
    background:
      "radial-gradient(circle at 32% 24%, rgba(255,255,255,0.64), rgba(235,236,242,0.38) 44%, rgba(15,23,42,0.28) 100%)",
    border: "1px solid rgba(255,255,255,0.38)",
    boxShadow:
      "inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -8px 22px rgba(15,23,42,0.08), 0 12px 24px rgba(0,0,0,0.26)",
  };
}

function getHeaderPanelStyle(style: TeamCardVisualStyle["headerTreatment"]): CSSProperties {
  if (style === "minimal") {
    return {
      background: "transparent",
      border: "none",
      boxShadow: "none",
      padding: "0",
    };
  }

  if (style === "glass-banner") {
    return {
      background:
        "linear-gradient(135deg, rgba(15,23,42,0.58), rgba(15,23,42,0.18) 62%, rgba(15,23,42,0.05))",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 10px 26px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
      padding: "clamp(8px, 1.2vw, 13px) clamp(10px, 1.5vw, 16px)",
      borderRadius: "16px",
    };
  }

  return {
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.44), rgba(15,23,42,0.16) 68%, rgba(15,23,42,0.04))",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
    padding: "clamp(7px, 1vw, 11px) clamp(9px, 1.35vw, 14px)",
    borderRadius: "14px",
  };
}

function getTrainerImageStyle(treatment: TeamCardVisualStyle["trainerTreatment"]): CSSProperties {
  if (treatment === "hero") {
    return {
      width: "340%",
      transform: "translateX(-50%) scale(1.24)",
      filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.62))",
    };
  }

  if (treatment === "spotlight") {
    return {
      width: "315%",
      transform: "translateX(-50%) scale(1.18)",
      filter:
        "drop-shadow(0 6px 20px rgba(0,0,0,0.58)) drop-shadow(0 0 18px rgba(255,255,255,0.2))",
    };
  }

  return {
    width: "300%",
    transform: "translateX(-50%) scale(1.12)",
    filter: "drop-shadow(0 5px 18px rgba(0,0,0,0.55))",
  };
}

function trainerColumnWidth(
  arrangement: TeamCardComposition["pokemonArrangement"],
  isMobileLayout: boolean,
): string {
  if (isMobileLayout) {
    return "28%";
  }
  if (arrangement === "ace-showcase") {
    return "34%";
  }
  if (arrangement === "grid-2x3") {
    return "27%";
  }
  return "31%";
}

function pokemonFormationStyle(
  arrangement: TeamCardComposition["pokemonArrangement"],
  isMobileLayout: boolean,
): CSSProperties {
  if (!isMobileLayout && arrangement === "ace-showcase") {
    return {
      gridTemplateColumns: "1.15fr repeat(2, minmax(0, 1fr))",
      gridTemplateRows: "repeat(2, minmax(0, 1fr))",
    };
  }

  return {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gridTemplateRows: "repeat(2, minmax(0, 1fr))",
  };
}

const TeamCardPreviewComponent = forwardRef<HTMLDivElement, TeamCardPreviewProps>(
  function TeamCardPreview(
    {
      teamSlots,
      teamName,
      trainerName,
      trainerDetails,
      background,
      trainer,
      spriteMode,
      slotCustomizations,
      visualStyle,
      composition,
      detailIconOptions,
      isMobileLayout = false,
    },
    ref,
  ) {
    const filledSlots = useMemo(
      () => Array.from({ length: SLOT_COUNT }, (_, i) => teamSlots[i] ?? null),
      [teamSlots],
    );
    const slotCustomizationMap = useMemo(
      () => new Map(slotCustomizations.map((entry) => [entry.slot, entry])),
      [slotCustomizations],
    );

    const detailIconMap = useMemo(
      () => new Map(detailIconOptions.map((entry) => [entry.slug, entry])),
      [detailIconOptions],
    );
    const hasTrainerHeadline = trainerName.trim().length > 0;
    const subtitleRow = trainerDetails[0];
    const hasSubtitleLine = Boolean(subtitleRow?.text?.trim());
    const showTrainerHeaderRow = hasTrainerHeadline || hasSubtitleLine;
    const labelStyle = getLabelStyle(visualStyle.labelStyle);
    const cardBorderStyle = getCardBorderStyle(visualStyle.borderStyle);
    const headerPanelStyle = getHeaderPanelStyle(visualStyle.headerTreatment);
    const trainerImageStyle = getTrainerImageStyle(visualStyle.trainerTreatment);
    const displayTeamName = teamName.trim() || "Team Card";
    const subtitleIcon =
      hasSubtitleLine && subtitleRow ? detailIconMap.get(subtitleRow.iconSlug) : undefined;
    const effectivePokemonArrangement = isMobileLayout ? "grid-2x3" : composition.pokemonArrangement;

    return (
      <div
        ref={ref}
        className={teamCardBodyFont.className}
        style={{
          width: "100%",
          aspectRatio: composition.aspectRatio,
          position: "relative",
          overflow: "hidden",
          borderRadius: "18px",
          background:
            "linear-gradient(135deg, rgba(76,29,89,0.95) 0%, rgba(45,27,60,0.98) 46%, rgba(24,18,38,0.98) 100%)",
          ...cardBorderStyle,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: CARD_INSET,
            borderRadius: "14px",
            backgroundImage: background.imagePath
              ? `url(${background.imagePath}), ${background.css}`
              : background.css,
            backgroundSize: background.imagePath ? "cover, auto" : undefined,
            backgroundPosition: background.imagePath ? "center, center" : undefined,
            backgroundRepeat: background.imagePath ? "no-repeat, no-repeat" : undefined,
            border: "1px solid rgba(255,255,255,0.32)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: CARD_INSET,
            borderRadius: "14px",
            background:
              getOverlayGradient(visualStyle.overlayIntensity) +
              ", radial-gradient(circle at 78% 46%, rgba(255,255,255,0.22), transparent 21%), linear-gradient(180deg, rgba(0,0,0,0.16), transparent 24%, rgba(0,0,0,0.34))",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: CARD_INSET,
            borderRadius: "14px",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -24px 50px rgba(0,0,0,0.24)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: CARD_INSET,
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: `minmax(0, 1fr) minmax(${isMobileLayout ? "116px" : "160px"}, ${trainerColumnWidth(
                effectivePokemonArrangement,
                isMobileLayout,
              )})`,
              gridTemplateRows: showTrainerHeaderRow ? "auto minmax(0, 1fr)" : "minmax(0, 1fr)",
              columnGap: "3.2%",
              rowGap: "2.2%",
              padding: "3.4% 3.7% 2.6%",
              minHeight: 0,
            }}
          >
            {showTrainerHeaderRow ? (
              <div
                style={{
                  gridColumn: 1,
                  gridRow: 1,
                  alignSelf: "start",
                  width: "min(100%, 430px)",
                  ...headerPanelStyle,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: hasTrainerHeadline ? "4px" : 0,
                    minWidth: 0,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: "clamp(22px, 3vw, 34px)",
                      aspectRatio: "1",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.96) 0 28%, rgba(239,68,68,0.95) 29% 48%, rgba(15,23,42,0.95) 49% 54%, rgba(255,255,255,0.92) 55% 100%)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.28)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: "rgba(255,255,255,0.64)",
                      fontSize: "clamp(7px, 0.8vw, 9px)",
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    Trainer Card
                  </span>
                  <span
                    aria-hidden
                    style={{
                      width: "3px",
                      aspectRatio: "1",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.26)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    title={displayTeamName}
                    style={{
                      minWidth: 0,
                      maxWidth: "min(46%, 170px)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      borderRadius: "999px",
                      padding: "clamp(1px, 0.25vw, 3px) clamp(6px, 0.7vw, 8px)",
                      background: "linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.58)",
                      fontSize: "clamp(6px, 0.68vw, 8px)",
                      fontWeight: 800,
                      letterSpacing: "0.085em",
                      textTransform: "uppercase",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045)",
                    }}
                  >
                    {displayTeamName}
                  </span>
                </div>

                {hasTrainerHeadline ? (
                  <span
                    className={teamCardTitleFont.className}
                    style={{
                      color: "rgba(255,255,255,0.98)",
                      fontSize: "clamp(18px, 2.75vw, 31px)",
                      fontWeight: 900,
                      letterSpacing: "0.055em",
                      textTransform: "uppercase",
                      textShadow: "0 2px 10px rgba(0,0,0,0.62)",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                      width: "100%",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      lineHeight: 1.02,
                      textAlign: "left",
                    }}
                  >
                    {trainerName}
                  </span>
                ) : null}

                {hasSubtitleLine && subtitleRow ? (
                  <span
                    key={subtitleRow.id}
                    className={trainerSocialStickerFont.className}
                    style={{
                      marginTop: "5px",
                      color: "#ffffff",
                      fontSize: "clamp(10px, 1.28vw, 15px)",
                      lineHeight: 1.1,
                      letterSpacing: "0.02em",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      WebkitTextStroke: "1.2px #0a0a0a",
                      paintOrder: "stroke fill",
                      textShadow: STICKER_OUTLINE_SHADOW,
                    }}
                  >
                    {subtitleIcon?.imagePath ? (
                      <img
                        src={subtitleIcon.imagePath}
                        alt=""
                        aria-hidden
                        crossOrigin="anonymous"
                        style={{
                          width: "clamp(15px, 1.65vw, 21px)",
                          height: "clamp(15px, 1.65vw, 21px)",
                          flexShrink: 0,
                          objectFit: "contain",
                          filter:
                            "drop-shadow(0 0 2px #0a0a0a) drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
                        }}
                      />
                    ) : (
                      <span>{subtitleIcon?.symbol ?? "•"}</span>
                    )}
                    <span>{subtitleRow.text}</span>
                  </span>
                ) : null}
              </div>
            ) : null}

            <div
              style={{
                gridColumn: 1,
                gridRow: showTrainerHeaderRow ? 2 : 1,
                minHeight: 0,
                minWidth: 0,
                alignSelf: "stretch",
                display: "grid",
                ...pokemonFormationStyle(effectivePokemonArrangement, isMobileLayout),
                gap: isMobileLayout ? "clamp(6px, 1.45vw, 10px)" : "clamp(5px, 1.35vw, 14px)",
                padding: isMobileLayout
                  ? "clamp(2px, 0.35vw, 4px) clamp(2px, 0.5vw, 5px)"
                  : "clamp(3px, 0.6vw, 8px) clamp(3px, 0.7vw, 9px)",
                borderRadius: "18px",
                background:
                  "radial-gradient(ellipse at 48% 82%, rgba(0,0,0,0.16), transparent 64%)",
                border: "1px solid rgba(255,255,255,0.015)",
                boxShadow: "0 16px 32px rgba(0,0,0,0.045)",
                overflow: "visible",
              }}
            >
              {filledSlots.map((slot, idx) => {
                const pokemon = slot?.pokemon ?? null;
                const slotNumber = slot?.slot ?? idx + 1;
                const customization = slotCustomizationMap.get(slotNumber);
                const effectiveSpriteMode = customization?.spriteMode ?? spriteMode;
                const spriteUrl =
                  pokemon
                    ? effectiveSpriteMode === "shiny"
                      ? (pokemon.spriteShiny ?? pokemon.spriteNormal)
                      : (pokemon.spriteNormal ?? pokemon.spriteShiny)
                    : null;
                const accent = pokemon ? TYPE_ACCENTS[pokemon.primaryType] : "rgba(255,255,255,0.45)";
                const secondaryAccent = pokemon?.secondaryType
                  ? TYPE_ACCENTS[pokemon.secondaryType]
                  : accent;
                const frameStyle = getPokemonFrameStyle(visualStyle.pokemonFrameStyle, accent);

                return (
                  <div
                    key={slotNumber}
                    style={{
                      position: "relative",
                      minHeight: 0,
                      minWidth: 0,
                      gridRow: !isMobileLayout && effectivePokemonArrangement === "ace-showcase" && idx === 0 ? "1 / 3" : undefined,
                      gridColumn: !isMobileLayout && effectivePokemonArrangement === "ace-showcase" && idx === 0 ? "1" : undefined,
                      transform:
                        !isMobileLayout && effectivePokemonArrangement === "diagonal-lines"
                          ? `translateY(${idx % 2 === 0 ? "-4%" : "4%"})`
                          : undefined,
                      display: "grid",
                      gridTemplateRows: isMobileLayout
                        ? "minmax(0, 1fr) minmax(16px, auto)"
                        : "minmax(0, 1fr) auto",
                      alignItems: "center",
                      justifyItems: "center",
                      rowGap: isMobileLayout ? "2px" : undefined,
                      padding: isMobileLayout ? "clamp(2px, 0.45vw, 5px)" : "clamp(3px, 0.7vw, 8px)",
                      overflow: "visible",
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: "8% 8% auto",
                        height: "65%",
                        borderRadius: "999px",
                        background: `radial-gradient(circle, ${accent}28 0%, transparent 66%)`,
                        filter: "blur(6px)",
                        opacity: pokemon ? 1 : 0.4,
                      }}
                    />

                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        width: isMobileLayout
                          ? "min(100%, clamp(44px, 7.1vw, 64px))"
                          : "min(100%, clamp(70px, 11vw, 124px))",
                        aspectRatio: "1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ...frameStyle,
                      }}
                    >
                      {pokemon ? (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            top: "8%",
                            right: "9%",
                            width: "clamp(7px, 0.9vw, 11px)",
                            aspectRatio: "1",
                            borderRadius: "50%",
                            background: accent,
                            boxShadow: `0 0 10px ${accent}`,
                          }}
                        />
                      ) : null}
                      <img
                        src={spriteUrl ?? POKEMON_PLACEHOLDER}
                        alt={pokemon?.name ?? `Slot ${idx + 1}`}
                        crossOrigin="anonymous"
                        loading="eager"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.src = pokemon ? POKEMON_PLACEHOLDER : EMPTY_SPRITE;
                        }}
                        style={{
                          position: "relative",
                          zIndex: 1,
                          width: isMobileLayout ? "104%" : "112%",
                          height: isMobileLayout ? "104%" : "112%",
                          objectFit: "contain",
                          filter: getSpriteFilter(visualStyle.spriteGlow, Boolean(pokemon)),
                        }}
                      />
                    </div>

                    {pokemon ? (
                      <span
                        style={{
                          position: "relative",
                          zIndex: 2,
                          marginTop: isMobileLayout ? "3px" : "-1px",
                          fontSize: isMobileLayout
                            ? "clamp(6.5px, 0.78vw, 8px)"
                            : "clamp(8px, 0.96vw, 11px)",
                          fontWeight: 800,
                          textTransform: "capitalize",
                          textAlign: "center",
                          lineHeight: isMobileLayout ? 1 : 1.1,
                          maxWidth: isMobileLayout ? "90%" : "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          boxShadow:
                            visualStyle.labelStyle === "minimal"
                              ? undefined
                              : `0 0 0 1px ${secondaryAccent}26, 0 6px 14px rgba(0,0,0,0.22)`,
                          ...labelStyle,
                        }}
                      >
                        {pokemon.name}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                gridColumn: 2,
                gridRow: showTrainerHeaderRow ? "1 / 3" : 1,
                minHeight: 0,
                minWidth: 0,
                alignSelf: "stretch",
                position: "relative",
                overflow: "visible",
                borderRadius: "18px",
                background:
                  "radial-gradient(ellipse at 52% 48%, rgba(255,255,255,0.14), rgba(255,255,255,0.04) 42%, rgba(15,23,42,0) 72%)",
                border: "1px solid rgba(255,255,255,0.03)",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "3%",
                  transform: "translateX(-50%)",
                  width: visualStyle.trainerTreatment === "hero" ? "118%" : "104%",
                  aspectRatio: "1 / 1.25",
                  borderRadius: "50%",
                  zIndex: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(ellipse 74% 92% at 50% 42%, rgba(255,255,255,0.34) 0%, rgba(235,236,242,0.17) 38%, rgba(99,102,241,0.08) 58%, rgba(15,23,42,0) 78%)",
                  boxShadow:
                    "0 18px 40px rgba(0,0,0,0.16)",
                  filter: "blur(1px)",
                }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "auto 8% 6%",
                  height: "18%",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(0,0,0,0.42), transparent 70%)",
                  filter: "blur(4px)",
                  zIndex: 1,
                }}
              />
              <img
                src={trainer.imagePath}
                alt={trainer.name}
                crossOrigin="anonymous"
                loading="eager"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src = TRAINER_PLACEHOLDER;
                }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  height: "100%",
                  transformOrigin: "center top",
                  objectFit: "cover",
                  objectPosition: "center top",
                  zIndex: 2,
                  ...trainerImageStyle,
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              right: "5.1%",
              bottom: "3.2%",
              zIndex: 5,
              pointerEvents: "none",
              textAlign: "right",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.26)",
                fontSize: "clamp(7px, 0.68vw, 8px)",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textShadow: "0 1px 5px rgba(0,0,0,0.55)",
              }}
            >
              PokemonTeamForge
            </span>
          </div>
        </div>
      </div>
    );
  },
);

export const TeamCardPreview = memo(TeamCardPreviewComponent);
