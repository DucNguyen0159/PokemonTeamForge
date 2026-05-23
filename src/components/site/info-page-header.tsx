type InfoPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function InfoPageHeader({ eyebrow = "Info", title, description }: InfoPageHeaderProps) {
  return (
    <header className="border-b border-border/60 pb-6">
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </header>
  );
}
