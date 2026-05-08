import Link from "next/link";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <PlaceholderPage
      eyebrow="Account"
      title="Create account"
      description="Registration will mirror the lightweight auth flow: minimal fields, no forced onboarding, and a quick return to whatever you were building."
    >
      <p className="text-sm text-muted-foreground">
        Registration UI and validation are not implemented yet.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled className="rounded-xl">
          Create account (soon)
        </Button>
        <Button asChild variant="ghost" size="sm" className="rounded-xl">
          <Link href="/login">Already have an account? Sign in</Link>
        </Button>
      </div>
    </PlaceholderPage>
  );
}
