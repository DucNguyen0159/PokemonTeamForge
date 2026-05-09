"use client";

import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type PickerModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function PickerModal({ title, isOpen, onClose, children }: PickerModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal
      aria-label={title}
      onMouseDown={onClose}
    >
      <div
        className="flex h-[92vh] w-full flex-col rounded-t-2xl border border-border/70 bg-[#0f1525] shadow-2xl sm:h-[85vh] sm:max-w-6xl sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
