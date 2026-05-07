import { notFound } from "next/navigation";

type PokemonDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold capitalize">Pokemon: {slug}</h1>
      <p className="text-sm text-slate-300">Detailed Pokemon pages are scaffolded and pending implementation.</p>
    </section>
  );
}
