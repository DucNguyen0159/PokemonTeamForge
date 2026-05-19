import type { Session, User } from "@supabase/supabase-js";

export type SessionReadyInput = {
  isInitialized: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  user: User | null;
  isLogoutInFlight: boolean;
  isLoading: boolean;
};

export function isSessionReadyForCloudData({
  isInitialized,
  isAuthenticated,
  session,
  user,
  isLogoutInFlight,
  isLoading,
}: SessionReadyInput): boolean {
  if (!isInitialized || !isAuthenticated || isLogoutInFlight || isLoading) {
    return false;
  }

  return Boolean(session && user?.id);
}

export function selectIsSessionReady(state: SessionReadyInput): boolean {
  return isSessionReadyForCloudData(state);
}
