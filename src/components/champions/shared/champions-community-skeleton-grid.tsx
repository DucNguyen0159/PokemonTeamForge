export function ChampionsCommunitySkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="animate-pulse space-y-3 rounded-2xl border border-border/60 bg-card/70 p-4"
        >
          <div className="h-4 w-2/3 rounded bg-muted/50" />
          <div className="h-3 w-1/3 rounded bg-muted/40" />
          <div className="grid grid-cols-2 gap-1.5">
            {Array.from({ length: 4 }, (_, tile) => (
              <div key={tile} className="h-12 rounded-lg bg-muted/35" />
            ))}
          </div>
          <div className="h-8 rounded-xl bg-muted/30" />
        </div>
      ))}
    </section>
  );
}
