import type { ReactNode } from "react";

import { InfoPageHeader } from "@/components/site/info-page-header";
import { InfoPagesNav } from "@/components/site/info-pages-nav";
import { cn } from "@/utils";

type InfoPageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function InfoPageShell({
  eyebrow = "Info",
  title,
  description,
  children,
  className,
}: InfoPageShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 lg:py-12">
      <div className="lg:grid lg:grid-cols-[11.5rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[12.5rem_minmax(0,1fr)] xl:gap-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <InfoPagesNav />
        </aside>

        <article className="mt-6 min-w-0 lg:mt-0">
          <InfoPageHeader eyebrow={eyebrow} title={title} description={description} />
          <div
            className={cn(
              "info-prose mt-8 space-y-8 border-t border-border/40 pt-8 text-sm leading-relaxed text-muted-foreground",
              "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground",
              "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground",
              "[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary",
              "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
              "[&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
              className,
            )}
          >
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}

export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/50 bg-card/20 p-4 sm:p-5">
      <h2>{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
