/* eslint-disable @next/next/no-img-element */
"use client";

import { forwardRef, memo, useMemo } from "react";

import type { BackgroundPreset, TrainerPreset } from "@/data/team-card-assets";
import { TYPE_COLORS } from "@/components/shared/type-badge";
import type { TeamPokemon } from "@/types/team";
import type { BattleFormat } from "@/types/shared";

export type SpriteMode = "normal" | "shiny";

type TeamCardPreviewProps = {
  teamSlots: TeamPokemon[];
  teamName: string;
  format: BattleFormat;
  background: BackgroundPreset;
  trainer: TrainerPreset;
  spriteMode: SpriteMode;
  showNames: boolean;
  showTypes: boolean;
};

const FORMAT_LABEL: Record<BattleFormat, string> = {
  singles: "Singles",
  doubles: "Doubles",
  triples: "Triples",
};

const SLOT_COUNT = 6;
const EMPTY_SPRITE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='44' fill='%23ffffff12' stroke='%23ffffff22' stroke-width='2'/%3E%3Ccircle cx='48' cy='48' r='18' fill='%23ffffff18'/%3E%3C/svg%3E";

const TeamCardPreviewComponent = forwardRef<HTMLDivElement, TeamCardPreviewProps>(
  function TeamCardPreview(
    { teamSlots, teamName, format, background, trainer, spriteMode, showNames, showTypes },
    ref,
  ) {
    const filledSlots = useMemo(
      () => Array.from({ length: SLOT_COUNT }, (_, i) => teamSlots[i] ?? null),
      [teamSlots],
    );

    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          aspectRatio: "16 / 7",
          position: "relative",
          overflow: "hidden",
          borderRadius: "16px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: background.css,
          }}
        />

        {/* Overlay gradient for readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* Decorative grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Content layer */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "5% 4%",
            gap: "4%",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.95)",
                fontSize: "clamp(14px, 2.4vw, 24px)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textShadow: "0 1px 8px rgba(0,0,0,0.6)",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {teamName || "Untitled Team"}
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "clamp(9px, 1.2vw, 12px)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: "99px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.1)",
                flexShrink: 0,
              }}
            >
              {FORMAT_LABEL[format]}
            </span>
          </div>

          {/* Main content row */}
          <div
            style={{
              display: "flex",
              flex: 1,
              gap: "3%",
              alignItems: "center",
              minHeight: 0,
            }}
          >
            {/* Trainer column */}
            <div
              style={{
                width: "18%",
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
                background: "rgba(255,255,255,0.15)",
                flexShrink: 0,
              }}
            />

            {/* Pokemon grid */}
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(2, 1fr)",
                gap: "2%",
                height: "100%",
              }}
            >
              {filledSlots.map((slot, idx) => {
                const pokemon = slot?.pokemon ?? null;
                const spriteUrl =
                  pokemon
                    ? spriteMode === "shiny"
                      ? (pokemon.spriteShiny ?? pokemon.spriteNormal)
                      : pokemon.spriteNormal
                    : EMPTY_SPRITE;
                const primaryType = pokemon?.primaryType;
                const typeColor = primaryType ? TYPE_COLORS[primaryType] : null;

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "2px",
                      padding: "4px",
                      borderRadius: "8px",
                      background: typeColor
                        ? `${typeColor}18`
                        : "rgba(255,255,255,0.05)",
                      border: `1px solid ${typeColor ? `${typeColor}30` : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    <img
                      src={spriteUrl}
                      alt={pokemon?.name ?? `Slot ${idx + 1}`}
                      crossOrigin="anonymous"
                      style={{
                        width: "clamp(36px, 6vw, 72px)",
                        height: "clamp(36px, 6vw, 72px)",
                        objectFit: "contain",
                        imageRendering: "pixelated",
                        filter: pokemon
                          ? "drop-shadow(0 1px 4px rgba(0,0,0,0.4))"
                          : "opacity(0.3)",
                      }}
                    />
                    {showNames && pokemon && (
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "clamp(7px, 0.9vw, 10px)",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          textAlign: "center",
                          lineHeight: 1.2,
                          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                          maxWidth: "90%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pokemon.name}
                      </span>
                    )}
                    {showTypes && pokemon && (
                      <div
                        style={{
                          display: "flex",
                          gap: "3px",
                          flexWrap: "wrap",
                          justifyContent: "center",
                        }}
                      >
                        {[pokemon.primaryType, pokemon.secondaryType]
                          .filter(Boolean)
                          .map((type) => {
                            const tColor = TYPE_COLORS[type as string] ?? "#9ca3af";
                            return (
                              <span
                                key={type}
                                style={{
                                  fontSize: "clamp(6px, 0.75vw, 8px)",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                  color: tColor,
                                  background: `${tColor}22`,
                                  border: `1px solid ${tColor}44`,
                                  borderRadius: "99px",
                                  padding: "1px 5px",
                                  lineHeight: 1.4,
                                }}
                              >
                                {type}
                              </span>
                            );
                          })}
                      </div>
                    )}
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
