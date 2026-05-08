"use client";

import { useCallback, useState } from "react";
import { Download, Check, AlertCircle } from "lucide-react";
import { toPng } from "html-to-image";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

type ExportStatus = "idle" | "exporting" | "success" | "error";

type ExportButtonProps = {
  cardRef: React.RefObject<HTMLDivElement | null>;
  teamName: string;
  className?: string;
};

export function ExportButton({ cardRef, teamName, className }: ExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    if (!cardRef.current) {
      return;
    }

    setStatus("exporting");
    setErrorMessage(null);

    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        fetchRequestInit: { mode: "cors" },
      });

      const slug = (teamName || "team")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const link = document.createElement("a");
      link.download = `${slug}-team-card.png`;
      link.href = dataUrl;
      link.click();

      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      console.error("[TeamCard Export]", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Export failed. Please try again.",
      );
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage(null);
      }, 4000);
    }
  }, [cardRef, teamName]);

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        onClick={() => {
          void handleExport();
        }}
        disabled={status === "exporting"}
        className="gap-2 rounded-xl"
        size="lg"
      >
        {status === "exporting" ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            Exporting…
          </>
        ) : status === "success" ? (
          <>
            <Check className="size-4" aria-hidden />
            Saved!
          </>
        ) : (
          <>
            <Download className="size-4" aria-hidden />
            Export PNG
          </>
        )}
      </Button>

      {status === "error" && errorMessage ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </div>
  );
}
