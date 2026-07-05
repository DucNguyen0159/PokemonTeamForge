"use client";

export function ChampionsPublishConfirmDialog({
  open,
  onConfirm,
  onCancel,
  isUnpublish = false,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isUnpublish?: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-background/70" aria-label="Close" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/60 bg-card p-5 shadow-xl">
        <h3 className="text-base font-semibold text-foreground">
          {isUnpublish ? "Unpublish this team?" : "Publish to Community?"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {isUnpublish
            ? "This team will be removed from Community Teams. Your saved cloud team is kept."
            : "Your roster, sets, SP spreads, and battle plans will be visible on Community Teams."}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-background/50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            onClick={onConfirm}
          >
            {isUnpublish ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
