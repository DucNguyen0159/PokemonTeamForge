import Link from "next/link";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <PlaceholderPage
      eyebrow="Account"
      title="Sign in"
      description="Supabase-powered login will live here. Guests can still use the builder and analysis; accounts are for saving progress and syncing data."
    >
      <p className="text-sm text-muted-foreground">
        No form yet—authentication is intentionally deferred.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled className="rounded-xl">
          Continue (soon)
        </Button>
        <Button asChild variant="ghost" size="sm" className="rounded-xl">
          <Link href="/register">Need an account? Register</Link>
        </Button>
      </div>
    </PlaceholderPage>
  );
}
