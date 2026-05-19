"use client";

import { useAuthStore } from "@/store/auth-store";
import { FINISHING_SIGN_OUT_MESSAGE } from "@/lib/auth/auth-utils";

export function useAuthFormAvailability() {
  const isLogoutInFlight = useAuthStore((state) => state.isLogoutInFlight);

  return {
    isLogoutInFlight,
    isFormDisabled: isLogoutInFlight,
    statusMessage: isLogoutInFlight ? FINISHING_SIGN_OUT_MESSAGE : null,
  };
}
