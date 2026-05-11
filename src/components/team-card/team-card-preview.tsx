/* eslint-disable @next/next/no-img-element */
"use client";

import { forwardRef, memo, useMemo, type CSSProperties } from "react";
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

/** Inset for artwork + content (tighter bottom = more room for team + trainer). */
const CARD_ART_INSET_TOP = "11%";
const CARD_ART_INSET_BOTTOM = "3.2%";
const CARD_ART_INSET_X = "3%";
const SLOT_COUNT = 6;
const EMPTY_SPRITE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='44' fill='%23ffffff12' stroke='%23ffffff22' stroke-width='2'/%3E%3Ccircle cx='48' cy='48' r='18' fill='%23ffffff18'/%3E%3C/svg%3E";
const TRAINER_PLACEHOLDER = "/placeholders/trainer-placeholder.svg";
const POKEMON_PLACEHOLDER = "/placeholders/pokemon-placeholder.svg";

/** Same frosted disk treatment as Pokémon slots (readability on busy backgrounds). */
const SLOT_FROSTED_DISK_STYLE: CSSProperties = {
  borderRadius: "50%",
  background:
    "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.62) 0%, rgba(235,236,242,0.5) 42%, rgba(195,198,210,0.45) 100%)",
  border: "1px solid rgba(255,255,255,0.42)",
  boxShadow:
    "inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(15,23,42,0.08), 0 8px 18px rgba(0,0,0,0.2)",
};

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
    const subtitleRow = trainerDetails[0];
    const hasSubtitleLine = Boolean(subtitleRow?.text?.trim());
    const showTrainerHeaderRow = hasTrainerHeadline || hasSubtitleLine;
    const subtitleIcon =
      hasSubtitleLine && subtitleRow ? detailIconMap.get(subtitleRow.iconSlug) : undefined;

    /* Builder team name is not shown on the card — trainer name is the headline. */
    void teamName;
    return (
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
        {/* Background — longhand only (no `background` shorthand) to avoid React warnings vs backgroundSize/Position */}
        <div
          style={{
            position: "absolute",
            top: CARD_ART_INSET_TOP,
            right: CARD_ART_INSET_X,
            bottom: CARD_ART_INSET_BOTTOM,
            left: CARD_ART_INSET_X,
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
            top: CARD_ART_INSET_TOP,
            right: CARD_ART_INSET_X,
            bottom: CARD_ART_INSET_BOTTOM,
            left: CARD_ART_INSET_X,
            borderRadius: "12px",
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.16) 50%, rgba(0,0,0,0.22) 100%)",
          }}
        />

        {/* Decorative grid lines */}
        <div
          style={{
            position: "absolute",
            top: CARD_ART_INSET_TOP,
            right: CARD_ART_INSET_X,
            bottom: CARD_ART_INSET_BOTTOM,
            left: CARD_ART_INSET_X,
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
            top: CARD_ART_INSET_TOP,
            right: CARD_ART_INSET_X,
            bottom: CARD_ART_INSET_BOTTOM,
            left: CARD_ART_INSET_X,
            display: "flex",
            flexDirection: "column",
            padding: "2.4% 3.2% 0",
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              position: "relative",
            }}
          >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 31%",
              gridTemplateRows: showTrainerHeaderRow ? "auto minmax(0, 1fr)" : "minmax(0, 1fr)",
              columnGap: "4%",
              rowGap: showTrainerHeaderRow ? "clamp(1px, 0.55%, 6px)" : "0px",
            }}
          >
            {showTrainerHeaderRow ? (
              <div style={{ gridColumn: 1, gridRow: 1, alignSelf: "start" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    maxWidth: "min(100%, 360px)",
                    padding: "6px 10px",
                    borderRadius: "10px",
                    background: "rgba(15,23,42,0.35)",
                    border: "1px solid rgba(255,255,255,0.12)",
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
                      {subtitleIcon?.imagePath ? (
                        <img
                          src={subtitleIcon.imagePath}
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
                        <span>{subtitleIcon?.symbol ?? "•"}</span>
                      )}
                      <span>{subtitleRow.text}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Pokémon column + vertical rule */}
            <div
              style={{
                gridColumn: 1,
                gridRow: showTrainerHeaderRow ? 2 : 1,
                display: "flex",
                flexDirection: "row",
                gap: "3%",
                minHeight: 0,
                minWidth: 0,
                alignSelf: "stretch",
                overflow: "visible",
              }}
            >
              <div
                style={{
                  width: "1px",
                  flexShrink: 0,
                  alignSelf: "stretch",
                  background: "rgba(255,255,255,0.22)",
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
                  gap: "1.5%",
                  height: "100%",
                  minHeight: 0,
                  minWidth: 0,
                  alignItems: "center",
                  overflow: "visible",
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
                      gap: "4px",
                      padding: "4px 0 2px",
                      position: "relative",
                      minHeight: 0,
                      width: "100%",
                      overflow: "visible",
                      zIndex: 1,
                    }}
                  >
                    {/* Frosted disk sits behind sprite; sprite is larger and may extend past the circle */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "clamp(52px, 10vw, 96px)",
                        overflow: "visible",
                      }}
                    >
                      <div
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "clamp(48px, 8.8vw, 82px)",
                          aspectRatio: "1",
                          zIndex: 0,
                          pointerEvents: "none",
                          ...SLOT_FROSTED_DISK_STYLE,
                        }}
                      />
                      {(formSymbol || iconSymbol) && (
                        <div
                          style={{
                            position: "absolute",
                            top: "clamp(2px, 0.55vw, 6px)",
                            right: "clamp(10%, 12%, 18%)",
                            display: "flex",
                            gap: 3,
                            zIndex: 2,
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
                          position: "relative",
                          zIndex: 1,
                          width: "clamp(54px, 11.8vw, 122px)",
                          height: "clamp(54px, 11.8vw, 122px)",
                          objectFit: "contain",
                          filter: pokemon
                            ? "drop-shadow(0 2px 5px rgba(0,0,0,0.35))"
                            : "opacity(0.45)",
                        }}
                      />
                    </div>
                    {pokemon ? (
                      <span
                        style={{
                          fontSize: "clamp(7px, 0.88vw, 10px)",
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
                          padding: "1px 6px",
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

            {/* Trainer hero only on the right — full column height (name + first detail line live in the left panel). */}
            <div
              style={{
                gridColumn: 2,
                gridRow: showTrainerHeaderRow ? "1 / 3" : 1,
                minHeight: 0,
                minWidth: 0,
                alignSelf: "stretch",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Tall ellipse — higher anchor so glow is not swallowed by bottom clip */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "clamp(13%, 18%, 34%)",
                  transform: "translateX(-50%)",
                  width: "min(64%, clamp(98px, 16vw, 152px))",
                  aspectRatio: "2 / 3.15",
                  borderRadius: "50%",
                  zIndex: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(ellipse 105% 100% at 50% 44%, rgba(255,255,255,0.58) 0%, rgba(235,236,242,0.44) 40%, rgba(195,198,210,0.34) 68%, rgba(195,198,210,0.06) 100%)",
                  border: "1px solid rgba(255,255,255,0.34)",
                  boxShadow:
                    "inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -6px 20px rgba(15,23,42,0.07), 0 10px 26px rgba(0,0,0,0.22)",
                }}
              />
              {/* Top-edge hero: crop from bottom-first; zoom expands downward from brim/hairline */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "2%",
                  right: "2%",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              >
                <img
                  src={trainer.imagePath}
                  alt={trainer.name}
                  crossOrigin="anonymous"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.src = TRAINER_PLACEHOLDER;
                  }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    width: "300%",
                    height: "100%",
                    transform: "translateX(-50%) scale(1.15)",
                    transformOrigin: "center top",
                    objectFit: "cover",
                    objectPosition: "center top",
                    filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.55))",
                  }}
                />
              </div>
            </div>
          </div>
          </div>

          {/* Footer watermark — overlaid so it does not steal vertical space from the team grid */}
          <div
            style={{
              position: "absolute",
              right: "2.8%",
              bottom: "1.2%",
              zIndex: 4,
              pointerEvents: "none",
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
