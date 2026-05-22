"use client";

import Image from "next/image";
import { memo, useState } from "react";

import { cn } from "@/utils";

const PLACEHOLDER_SPRITE = "/placeholders/pokemon-placeholder.svg";
const DEFAULT_FILL_SIZES = "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 320px";

type PokemonSpriteProps = {
  src?: string | null;
  alt: string;
  className?: string;
  /** Fixed width/height mode (default). Ignored when `fill` is true. */
  size?: number;
  /** Fill the nearest `position: relative` parent. Parent must have explicit dimensions. */
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

function PokemonSpriteComponent({
  src,
  alt,
  className,
  size = 48,
  fill = false,
  sizes,
  priority = false,
}: PokemonSpriteProps) {
  const [isFallback, setIsFallback] = useState(false);
  const finalSrc = !isFallback && src ? src : PLACEHOLDER_SPRITE;

  if (fill) {
    return (
      <Image
        src={finalSrc}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        sizes={sizes ?? DEFAULT_FILL_SIZES}
        className={cn("object-contain", className)}
        onError={() => setIsFallback(true)}
      />
    );
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      priority={priority}
      className={className}
      onError={() => setIsFallback(true)}
    />
  );
}

export const PokemonSprite = memo(PokemonSpriteComponent);
