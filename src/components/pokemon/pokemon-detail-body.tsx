"use client";

import type { ReactNode } from "react";

import { TypeChartFab, TypeChartProvider } from "@/components/type-chart/type-chart-reference";

type PokemonDetailBodyProps = {
  children: ReactNode;
};

export function PokemonDetailBody({ children }: PokemonDetailBodyProps) {
  return (
    <TypeChartProvider context="detail">
      {children}
      <TypeChartFab />
    </TypeChartProvider>
  );
}
