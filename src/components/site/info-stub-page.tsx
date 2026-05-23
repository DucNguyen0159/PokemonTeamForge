import { PageIntro } from "@/components/layout/page-intro";

type InfoStubPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function InfoStubPage({
  eyebrow = "Info",
  title,
  description,
}: InfoStubPageProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Content coming soon.
      </p>
    </div>
  );
}
