"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/utils";

export type AppToastKind = "success" | "error";

type ToastState = {
  message: string;
  kind: AppToastKind;
} | null;

type ToastContextValue = {
  showToast: (message: string, kind?: AppToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DISMISS_MS = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string, kind: AppToastKind = "success") => {
      clearDismissTimer();
      setToast({ message, kind });
      dismissTimerRef.current = setTimeout(() => {
        setToast(null);
        dismissTimerRef.current = null;
      }, TOAST_DISMISS_MS);
    },
    [clearDismissTimer],
  );

  useEffect(() => () => clearDismissTimer(), [clearDismissTimer]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
          aria-live="polite"
        >
          <p
            role="status"
            className={cn(
              "pointer-events-auto flex max-w-md items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg",
              toast.kind === "success"
                ? "border-emerald-400/40 bg-emerald-600 text-white"
                : "border-destructive/50 bg-destructive text-destructive-foreground",
            )}
          >
            {toast.kind === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            <span>{toast.message}</span>
          </p>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useAppToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAppToast must be used within ToastProvider");
  }

  return context;
}
