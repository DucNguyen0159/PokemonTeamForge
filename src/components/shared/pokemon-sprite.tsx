"use client";

import Image from "next/image";
import { memo, useState } from "react";

const PLACEHOLDER_SPRITE = "/placeholders/pokemon-placeholder.svg";

type PokemonSpriteProps = {
  src?: string | null;
  alt: string;
  className?: string;
  size?: number;
};

function PokemonSpriteComponent({
  src,
  alt,
  className,
  size = 48,
}: PokemonSpriteProps) {
  const [isFallback, setIsFallback] = useState(false);
  const finalSrc = !isFallback && src ? src : PLACEHOLDER_SPRITE;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={className}
      onError={() => setIsFallback(true)}
    />
  );
}

export const PokemonSprite = memo(PokemonSpriteComponent);
