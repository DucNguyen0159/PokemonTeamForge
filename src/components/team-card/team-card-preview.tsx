/* eslint-disable @next/next/no-img-element */
"use client";

import { forwardRef, memo, useMemo } from "react";
import { Inter, Luckiest_Guy, Montserrat } from "next/font/google";

import type {
  TeamCardBackgroundAsset,
  TeamCardFormOption,
  TeamCardIconOption,
  TeamCardTrainerVariant,
} from "@/data/team-card-assets";
import type { TeamCardDetailRow, TeamCardSlotCustomization, TeamCardSpriteMode } from "@/types/team-card";
import type { TeamPokemon } from "@/types/team";

/** Option E: geometric display title + neutral body (Inter reads similar to system UI without explicit webfont). */
const teamCardTitleFont = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const teamCardBodyFont = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/** Rounded “sticker” / social caption style (white fill + heavy outline), per reference. */
const trainerSocialStickerFont = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
});

/** Thick cartoon outline: stroke + ring of shadows (readable on busy PNG backgrounds). */
const STICKER_OUTLINE_SHADOW =
  "1px 1px 0 #0a0a0a, -1px -1px 0 #0a0a0a, 1px -1px 0 #0a0a0a, -1px 1px 0 #0a0a0a, 2px 0 0 #0a0a0a, -2px 0 0 #0a0a0a, 0 2px 0 #0a0a0a, 0 -2px 0 #0a0a0a, 2px 2px 0 #0a0a0a, -2px -2px 0 #0a0a0a, 2px -2px 0 #0a0a0a, -2px 2px 0 #0a0a0a";

type TeamCardPreviewProps = {
  teamSlots: TeamPokemon[];
  /** Builder team name; not shown on the card (trainer name is the headline). */
  teamName: string;
  trainerName: string;
  trainerDetails: TeamCardDetailRow[];
  background: TeamCardBackgroundAsset;
  trainer: TeamCardTrainerVariant;
  spriteMode: TeamCardSpriteMode;
  slotCustomizations: TeamCardSlotCustomization[];
  detailIconOptions: TeamCardIconOption[];
  formOptions: TeamCardFormOption[];
  slotIconOptions: TeamCardIconOption[];
};

const SLOT_COUNT = 6;
const EMPTY_SPRITE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='44' fill='%23ffffff12' stroke='%23ffffff22' stroke-width='2'/%3E%3Ccircle cx='48' cy='48' r='18' fill='%23ffffff18'/%3E%3C/svg%3E";
const TRAINER_PLACEHOLDER = "/placeholders/trainer-placeholder.svg";
const POKEMON_PLACEHOLDER = "/placeholders/pokemon-placeholder.svg";

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
      detailIconOptions,
      formOptions,
      slotIconOptions,
    },
    ref,
  ) {
    const filledSlots = useMemo(
      () => Array.from({ length: SLOT_COUNT }, (_, i) => teamSlots[i] ?? null),
      [teamSlots],
    );

    const detailIconMap = useMemo(
      () => new Map(detailIconOptions.map((entry) => [entry.slug, entry])),
      [detailIconOptions],
    );
    const formMap = useMemo(
      () => new Map(formOptions.map((entry) => [entry.slug, entry.symbol])),
      [formOptions],
    );
    const slotIconMap = useMemo(
      () => new Map(slotIconOptions.map((entry) => [entry.slug, entry.symbol])),
      [slotIconOptions],
    );
    const hasTrainerHeadline = trainerName.trim().length > 0;
    const hasTrainerDetailLines = trainerDetails.some((row) => row.text.trim().length > 0);

    /* Builder team name is not shown on the card — trainer name is the headline. */
    void teamName;    return (
      <div
        ref={ref}
        className={teamCardBodyFont.className}
        style={{
          width: "100%",
          aspectRatio: "5 / 3",
          position: "relative",
          overflow: "hidden",
          borderRadius: "18px",
          background:
            "linear-gradient(135deg, rgba(76,29,89,0.95) 0%, rgba(45,27,60,0.98) 46%, rgba(24,18,38,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 18px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "4%",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#b91c1c",
            fontSize: "clamp(14px, 2.1vw, 22px)",
            fontWeight: 800,
            letterSpacing: "0.02em",
            textShadow: "0 1px 2px rgba(0,0,0,0.45)",
            zIndex: 10,
          }}
        >
          Card Preview
        </div>

        {/* Background — longhand only (no `background` shorthand) to avoid React warnings vs backgroundSize/Position */}
        <div
          style={{
            position: "absolute",
            top: "13%",
            right: "3%",
            bottom: "5%",
            left: "3%",
            borderRadius: "12px",
            backgroundImage: background.imagePath
              ? `url(${background.imagePath}), ${background.css}`
              : background.css,
            backgroundSize: background.imagePath ? "cover, auto" : undefined,
            backgroundPosition: background.imagePath ? "center, center" : undefined,
            backgroundRepeat: background.imagePath ? "no-repeat, no-repeat" : undefined,
            border: "1px solid rgba(255,255,255,0.35)",
          }}
        />

        {/* Overlay gradient for readability */}
        <div
          style={{
            position: "absolute",
            top: "13%",
            right: "3%",
            bottom: "5%",
            left: "3%",
            borderRadius: "12px",
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.16) 50%, rgba(0,0,0,0.22) 100%)",
          }}
        />

        {/* Decorative grid lines */}
        <div
          style={{
            position: "absolute",
            top: "13%",
            right: "3%",
            bottom: "5%",
            left: "3%",
            borderRadius: "12px",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Content layer */}
        <div
          style={{
            position: "absolute",
            top: "13%",
            right: "3%",
            bottom: "5%",
            left: "3%",
            display: "flex",
            flexDirection: "column",
            padding: "4% 4% 3.5%",
            gap: "3%",
          }}
        >
          {/* Top band: social rows on the left, trainer name on the right (above trainer art column) */}
          {hasTrainerHeadline || hasTrainerDetailLines ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "4%",
                flexShrink: 0,
                width: "100%",
              }}
            >
              <div style={{ flex: "1 1 0", minWidth: 0 }}>
                {hasTrainerDetailLines ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      maxWidth: "min(100%, 360px)",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      background: "rgba(15,23,42,0.35)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {trainerDetails
                      .filter((row) => row.text.trim().length > 0)
                      .map((row) => {
                        const icon = detailIconMap.get(row.iconSlug);

                        return (
                          <span
                            key={row.id}
                            className={trainerSocialStickerFont.className}
                            style={{
                              color: "#ffffff",
                              fontSize: "clamp(11px, 1.45vw, 16px)",
                              lineHeight: 1.15,
                              letterSpacing: "0.02em",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              WebkitTextStroke: "1.25px #0a0a0a",
                              paintOrder: "stroke fill",
                              textShadow: STICKER_OUTLINE_SHADOW,
                            }}
                          >
                            {icon?.imagePath ? (
                              <img
                                src={icon.imagePath}
                                alt=""
                                aria-hidden
                                crossOrigin="anonymous"
                                style={{
                                  width: "clamp(16px, 1.75vw, 22px)",
                                  height: "clamp(16px, 1.75vw, 22px)",
                                  flexShrink: 0,
                                  objectFit: "contain",
                                  filter:
                                    "drop-shadow(0 0 2px #0a0a0a) drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
                                }}
                              />
                            ) : (
                              <span>{icon?.symbol ?? "•"}</span>
                            )}
                            <span>{row.text}</span>
                          </span>
                        );
                      })}
                  </div>
                ) : null}
              </div>
              <div
                style={{
                  width: "31%",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  textAlign: "right",
                  minWidth: 0,
                }}
              >
                {hasTrainerHeadline ? (
                  <span
                    className={teamCardTitleFont.className}
                    style={{
                      color: "rgba(255,255,255,0.95)",
                      fontSize: "clamp(14px, 2.35vw, 24px)",
                      fontWeight: 900,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      textShadow: "0 1px 8px rgba(0,0,0,0.6)",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 3,
                      overflow: "hidden",
                      width: "100%",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      lineHeight: 1.12,
                      textAlign: "right",
                    }}
                  >
                    {trainerName}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Main content row */}
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row-reverse",
              gap: "4%",
              alignItems: "center",
              minHeight: 0,
            }}
          >
            {/* Trainer column */}
            <div
              style={{
                width: "31%",
                flexShrink: 0,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <img
                src={trainer.imagePath}
                alt={trainer.name}
                crossOrigin="anonymous"
                onError={(event) => {
                  event.currentTarget.src = TRAINER_PLACEHOLDER;
                }}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.5))",
                }}
              />
            </div>

            {/* Separator */}
            <div
              style={{
                width: "1px",
                alignSelf: "stretch",
                background: "rgba(255,255,255,0.22)",
                flexShrink: 0,
              }}
            />

            {/* Pokemon grid */}
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(2, 1fr)",
                gap: "2%",
                height: "100%",
                alignItems: "center",
              }}
            >
              {filledSlots.map((slot, idx) => {
                const pokemon = slot?.pokemon ?? null;
                const slotNumber = slot?.slot ?? idx + 1;
                const customization = slotCustomizations.find((entry) => entry.slot === slotNumber);
                const effectiveSpriteMode = customization?.spriteMode ?? spriteMode;
                const spriteUrl =
                  pokemon
                    ? effectiveSpriteMode === "shiny"
                      ? (pokemon.spriteShiny ?? pokemon.spriteNormal)
                      : (pokemon.spriteNormal ?? pokemon.spriteShiny)
                    : null;
                const formSymbol =
                  customization && customization.formSlug !== "none"
                    ? formMap.get(customization.formSlug) ?? null
                    : null;
                const iconSymbol =
                  customization && customization.iconSlug !== "none"
                    ? slotIconMap.get(customization.iconSlug) ?? null
                    : null;

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "4px 2px",
                      position: "relative",
                      minHeight: 0,
                      width: "100%",
                    }}
                  >
                    {/* Neutral frosted disk — same for every slot (readability on busy illustration backs) */}
                    <div
                      style={{
                        position: "relative",
                        width: "clamp(52px, 9.5vw, 88px)",
                        aspectRatio: "1",
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.62) 0%, rgba(235,236,242,0.5) 42%, rgba(195,198,210,0.45) 100%)",
                        border: "1px solid rgba(255,255,255,0.42)",
                        boxShadow:
                          "inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(15,23,42,0.08), 0 8px 18px rgba(0,0,0,0.2)",
                      }}
                    >
                      {(formSymbol || iconSymbol) && (
                        <div
                          style={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            display: "flex",
                            gap: 3,
                            zIndex: 1,
                          }}
                        >
                          {formSymbol ? (
                            <span
                              style={{
                                display: "inline-flex",
                                minWidth: 14,
                                height: 14,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 999,
                                fontSize: 8,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.9)",
                                background: "rgba(15,23,42,0.8)",
                                border: "1px solid rgba(255,255,255,0.18)",
                              }}
                            >
                              {formSymbol}
                            </span>
                          ) : null}
                          {iconSymbol ? (
                            <span
                              style={{
                                display: "inline-flex",
                                minWidth: 14,
                                height: 14,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 999,
                                fontSize: 8,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.9)",
                                background: "rgba(15,23,42,0.8)",
                                border: "1px solid rgba(255,255,255,0.18)",
                              }}
                            >
                              {iconSymbol}
                            </span>
                          ) : null}
                        </div>
                      )}
                      <img
                        src={spriteUrl ?? POKEMON_PLACEHOLDER}
                        alt={pokemon?.name ?? `Slot ${idx + 1}`}
                        crossOrigin="anonymous"
                        onError={(event) => {
                          event.currentTarget.src = pokemon ? POKEMON_PLACEHOLDER : EMPTY_SPRITE;
                        }}
                        style={{
                          width: "clamp(36px, 6vw, 72px)",
                          height: "clamp(36px, 6vw, 72px)",
                          objectFit: "contain",
                          imageRendering: "pixelated",
                          filter: pokemon
                            ? "drop-shadow(0 2px 5px rgba(0,0,0,0.35))"
                            : "opacity(0.45)",
                        }}
                      />
                    </div>
                    {pokemon ? (
                      <span
                        style={{
                          fontSize: "clamp(8px, 0.95vw, 11px)",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          textAlign: "center",
                          lineHeight: 1.2,
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          background: "rgba(248,250,252,0.94)",
                          color: "#1f2937",
                          borderRadius: "999px",
                          padding: "2px 8px",
                          border: "1px solid rgba(15,23,42,0.08)",
                          textShadow: "none",
                        }}
                      >
                        {pokemon.name}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer watermark */}
          <div
            style={{
              textAlign: "right",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: "clamp(7px, 0.8vw, 9px)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              PokémonTeamForge
            </span>
          </div>
        </div>
      </div>
    );
  },
);

export const TeamCardPreview = memo(TeamCardPreviewComponent);
