import { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";

type PlaceholderPageProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
};

export function PlaceholderPage({
  title,
  description,
  eyebrow,
  children,
  className,
}: PlaceholderPageProps) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl space-y-6 px-4 py-8", className)}>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}

      <Card className="rounded-2xl border-border/60 bg-card text-card-foreground shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        {children ? <CardContent className="space-y-4 pt-0">{children}</CardContent> : null}
      </Card>
    </div>
  );
}
