function SectionPlaceholder({ title }: { title: string }) {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-slate-300">This section is intentionally scaffolded for upcoming implementation.</p>
    </section>
  );
}

export default function BuilderPage() {
  return <SectionPlaceholder title="Team Builder" />;
}
