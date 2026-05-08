import { PokedexExplorer } from "@/components/pokedex/pokedex-explorer";

export default function PokedexPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pokédex</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Browse Pokémon
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A lightweight catalog for discovering Pokémon: search, narrow by type or generation, then add
          contenders to your team. Battle-relevant stats only—no lore dumps or training noise.
        </p>
      </header>

      <PokedexExplorer />
    </div>
  );
}
