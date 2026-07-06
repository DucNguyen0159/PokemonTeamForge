"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ChampionsPresetDetailView } from "@/components/champions/champions-preset-detail-view";
import { ChampionsShell } from "@/components/champions/champions-shell";
import { Button } from "@/components/ui/button";
import { getChampionsPresetById } from "@/data/champions-presets";

export default function ChampionsPresetDetailPage() {
  const params = useParams<{ presetId: string }>();
  const presetId = params?.presetId ?? "";
  const preset = getChampionsPresetById(presetId);

  if (!preset) {
    return (
      <ChampionsShell
        eyebrow="Strategy Presets"
        title="Preset not found"
        description="The requested preset does not exist."
      >
        <Button asChild>
          <Link href="/champions/presets">Back to presets</Link>
        </Button>
      </ChampionsShell>
    );
  }

  return <ChampionsPresetDetailView preset={preset} />;
}
