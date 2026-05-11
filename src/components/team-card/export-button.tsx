"use client";

import { memo, useCallback, useState } from "react";
import { Download, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/error/error-message";
import { cn } from "@/utils";

type ExportStatus = "idle" | "exporting" | "success" | "error";

type ExportButtonProps = {
  cardRef: React.RefObject<HTMLDivElement | null>;
  teamName: string;
  className?: string;
};

function ExportButtonComponent({ cardRef, teamName, className }: ExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    if (!cardRef.current) {
      return;
    }

    setStatus("exporting");
    setErrorMessage(null);

    try {
      const { toPng } = await import("html-to-image");
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
      setErrorMessage("Could not export the image. Please try again.");
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
            <span className="size-4 animate-spin rounded-full border-2 border-neutral-950/25 border-t-neutral-950" />
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
        <ErrorMessage title="Export failed" message={errorMessage} />
      ) : null}
    </div>
  );
}

export const ExportButton = memo(ExportButtonComponent);
