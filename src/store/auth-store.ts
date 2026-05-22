import { create } from "zustand";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import {
  CHANGE_PASSWORD_SUCCESS_MESSAGE,
  PASSWORD_RESET_EMAIL_SENT_MESSAGE,
} from "@/lib/auth/auth-constants";
import {
  createAuthGenerationGuard,
  createAuthOperationQueue,
  createLogoutInFlightTracker,
} from "@/lib/auth/auth-operations";
import { getPasswordResetRedirectUrl, sanitizeUsername } from "@/lib/auth/auth-utils";
import { selectIsSessionReady } from "@/lib/auth/session-ready";

export { selectIsSessionReady };
import { runLogoutCleanupWithTimeout } from "@/lib/auth/logout-utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toFriendlySupabaseMessage } from "@/lib/supabase/errors";
import type { UserProfile } from "@/types/user";

type AuthActionResult = {
  success: boolean;
  message?: string;
};

type RegisterInput = {
  email: string;
  password: string;
  username?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthStoreState = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLogoutInFlight: boolean;
  isInitialized: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  register: (input: RegisterInput) => Promise<AuthActionResult>;
  login: (input: LoginInput) => Promise<AuthActionResult>;
  requestPasswordReset: (email: string) => Promise<AuthActionResult>;
  updatePassword: (password: string) => Promise<AuthActionResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthActionResult>;
  logout: () => Promise<AuthActionResult>;
  clearError: () => void;
};

let authListenerInitialized = false;

const authOperationQueue = createAuthOperationQueue();
const authGeneration = createAuthGenerationGuard();
const logoutInFlightTracker = createLogoutInFlightTracker();

function signedOutState() {
  return {
    session: null,
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    isLogoutInFlight: logoutInFlightTracker.isInFlight(),
    isInitialized: true,
    error: null,
  };
}

function applyAuthenticatedState(
  session: Session,
  user: User,
  profile: UserProfile | null,
) {
  return {
    session,
    user,
    profile,
    isAuthenticated: true,
    isLoading: false,
    isLogoutInFlight: false,
    error: null,
  };
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id as string,
    username: (data.username as string) ?? "",
    avatarUrl: (data.avatar_url as string | null) ?? null,
    createdAt: data.created_at as string,
  };
}

async function ensureProfileRecord(
  userId: string,
  username: string | null | undefined,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const sanitizedUsername = sanitizeUsername(username, userId);
  const fallbackUsername = sanitizeUsername(null, userId);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      username: sanitizedUsername,
    },
    { onConflict: "id" },
  );

  if (!error) {
    return;
  }

  const isUsernameConflict = error.code === "23505" && sanitizedUsername !== fallbackUsername;
  if (!isUsernameConflict) {
    throw error;
  }

  const { error: fallbackError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      username: fallbackUsername,
    },
    { onConflict: "id" },
  );

  if (fallbackError) {
    throw fallbackError;
  }
}

async function ensureAndFetchUserProfile(
  user: User,
  fallbackUsername: string | null | undefined,
): Promise<UserProfile | null> {
  const existingProfile = await fetchUserProfile(user.id);
  if (existingProfile) {
    return existingProfile;
  }

  await ensureProfileRecord(
    user.id,
    (user.user_metadata?.username as string | undefined) ?? fallbackUsername,
  );
  return await fetchUserProfile(user.id);
}

const PROFILE_REUSE_AUTH_EVENTS = new Set<AuthChangeEvent>([
  "TOKEN_REFRESHED",
  "USER_UPDATED",
  "PASSWORD_RECOVERY",
]);

async function enrichAuthenticatedProfile(
  set: (partial: Partial<AuthStoreState>) => void,
  getState: () => AuthStoreState,
  session: Session,
  user: User,
  operationGeneration: number,
): Promise<void> {
  try {
    const profile = await ensureAndFetchUserProfile(
      user,
      user.user_metadata?.username ?? user.email,
    );

    if (authGeneration.isStale(operationGeneration)) {
      return;
    }

    const state = getState();
    if (!state.isAuthenticated || state.user?.id !== user.id) {
      return;
    }

    set(applyAuthenticatedState(session, user, profile));
  } catch {
    // Keep the signed-in session even if profile sync fails.
  }
}

function resolveProfileForSession(
  state: AuthStoreState,
  user: User,
  fallbackUsername: string | null | undefined,
  event?: AuthChangeEvent,
): Promise<UserProfile | null> {
  if (
    state.profile &&
    state.user?.id === user.id &&
    (event === undefined || PROFILE_REUSE_AUTH_EVENTS.has(event))
  ) {
    return Promise.resolve(state.profile);
  }

  return ensureAndFetchUserProfile(user, fallbackUsername);
}

async function applyAuthStateChange(
  set: (partial: Partial<AuthStoreState>) => void,
  getState: () => AuthStoreState,
  nextSession: Session | null,
  eventGeneration: number,
  event: AuthChangeEvent,
) {
  if (authGeneration.isStale(eventGeneration)) {
    return;
  }

  if (!nextSession?.user) {
    const shouldSignOut =
      logoutInFlightTracker.isInFlight() || !getState().isAuthenticated;

    if (!authGeneration.isStale(eventGeneration) && shouldSignOut) {
      set(signedOutState());
    }
    return;
  }

  const state = getState();
  if (
    event === "SIGNED_IN" &&
    state.isAuthenticated &&
    state.user?.id === nextSession.user.id
  ) {
    if (!authGeneration.isStale(eventGeneration)) {
      set(applyAuthenticatedState(nextSession, nextSession.user, state.profile));
    }
    return;
  }

  try {
    const profile = await resolveProfileForSession(
      getState(),
      nextSession.user,
      nextSession.user.email,
      event,
    );
    if (authGeneration.isStale(eventGeneration)) {
      return;
    }

    set(applyAuthenticatedState(nextSession, nextSession.user, profile));
  } catch {
    if (authGeneration.isStale(eventGeneration)) {
      return;
    }

    set({
      ...applyAuthenticatedState(nextSession, nextSession.user, null),
      profile: null,
    });
  }
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  isLogoutInFlight: false,
  isInitialized: false,
  error: null,

  initializeAuth: async () => {
    if (get().isInitialized) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (session?.user) {
        const profile = await ensureAndFetchUserProfile(session.user, session.user.email);
        set({
          ...applyAuthenticatedState(session, session.user, profile),
          isInitialized: true,
        });
      } else {
        set({
          session: null,
          user: null,
          profile: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          isLogoutInFlight: false,
        });
      }
    } catch (error) {
      set({
        error: toFriendlySupabaseMessage(
          error,
          "Unable to restore your account session.",
        ),
        session: null,
        user: null,
        profile: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
        isLogoutInFlight: false,
      });
    }

    if (authListenerInitialized) {
      return;
    }

    authListenerInitialized = true;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.onAuthStateChange(async (event, nextSession) => {
      const eventGeneration = authGeneration.get();
      await applyAuthStateChange(set, get, nextSession, eventGeneration, event);
    });
  },

  register: async ({ email, password, username }) => {
    return authOperationQueue.enqueue(async () => {
      await logoutInFlightTracker.waitUntilSettled();
      const operationGeneration = authGeneration.bump();

      set({ isLoading: true, error: null });

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username?.trim() || null,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (authGeneration.isStale(operationGeneration)) {
          return { success: false, message: "Registration was interrupted. Please try again." };
        }

        if (data.user && data.session) {
          await ensureProfileRecord(data.user.id, username ?? data.user.email);
        }

        if (data.session && data.user) {
          const profile = await ensureAndFetchUserProfile(data.user, username ?? data.user.email);
          if (authGeneration.isStale(operationGeneration)) {
            return { success: false, message: "Registration was interrupted. Please try again." };
          }

          set({
            ...applyAuthenticatedState(data.session, data.user, profile),
            isInitialized: true,
          });
        } else {
          set({ isLoading: false });
        }

        return {
          success: true,
          message:
            data.session === null
              ? "Registration successful. Check your email to confirm your account."
              : "Registration successful. You are now signed in.",
        };
      } catch (error) {
        const friendly = toFriendlySupabaseMessage(
          error,
          "Unable to register right now. Please try again.",
        );
        set({ isLoading: false, error: friendly });
        return { success: false, message: friendly };
      }
    });
  },

  login: async ({ email, password }) => {
    return authOperationQueue.enqueue(async () => {
      await logoutInFlightTracker.waitUntilSettled();
      set({ error: null });

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (!data.session || !data.user) {
          throw new Error("Unable to log in right now. Please try again.");
        }

        set({
          ...applyAuthenticatedState(data.session, data.user, null),
          isInitialized: true,
        });

        const operationGeneration = authGeneration.bump();
        void enrichAuthenticatedProfile(set, get, data.session, data.user, operationGeneration);

        return { success: true };
      } catch (error) {
        const friendly = toFriendlySupabaseMessage(
          error,
          "Unable to log in right now. Please try again.",
        );
        set({ isLoading: false, error: friendly });
        return { success: false, message: friendly };
      }
    });
  },

  requestPasswordReset: async (email) => {
    return authOperationQueue.enqueue(async () => {
      await logoutInFlightTracker.waitUntilSettled();
      const operationGeneration = authGeneration.bump();

      set({ error: null });

      try {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: getPasswordResetRedirectUrl(),
        });

        if (error) {
          throw error;
        }

        if (authGeneration.isStale(operationGeneration)) {
          return {
            success: false,
            message: "Password reset request was interrupted. Please try again.",
          };
        }

        return {
          success: true,
          message: PASSWORD_RESET_EMAIL_SENT_MESSAGE,
        };
      } catch (error) {
        const friendly = toFriendlySupabaseMessage(
          error,
          "Unable to send a reset link right now. Please try again.",
        );
        set({ error: friendly });
        return { success: false, message: friendly };
      }
    });
  },

  updatePassword: async (password) => {
    return authOperationQueue.enqueue(async () => {
      await logoutInFlightTracker.waitUntilSettled();
      const operationGeneration = authGeneration.bump();

      set({ error: null });

      try {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          throw error;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (authGeneration.isStale(operationGeneration)) {
          return {
            success: false,
            message: "Password update was interrupted. Please try again.",
          };
        }

        if (session?.user) {
          const profile = await resolveProfileForSession(
            get(),
            session.user,
            session.user.user_metadata?.username ?? session.user.email,
          );

          if (authGeneration.isStale(operationGeneration)) {
            return {
              success: false,
              message: "Password update was interrupted. Please try again.",
            };
          }

          set({
            ...applyAuthenticatedState(session, session.user, profile),
            isInitialized: true,
          });
        }

        return {
          success: true,
          message: session
            ? "Password updated. You are now signed in."
            : "Password updated. Sign in with your new password.",
        };
      } catch (error) {
        const friendly = toFriendlySupabaseMessage(
          error,
          "Unable to update your password right now. Please try again.",
        );
        set({ error: friendly });
        return { success: false, message: friendly };
      }
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return authOperationQueue.enqueue(async () => {
      await logoutInFlightTracker.waitUntilSettled();

      const state = get();
      const email = state.user?.email?.trim();

      if (!email || !state.isAuthenticated) {
        return {
          success: false,
          message: "Sign in again to change your password.",
        };
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });

        if (verifyError) {
          throw verifyError;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          throw updateError;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          set({
            ...applyAuthenticatedState(session, session.user, state.profile),
            isInitialized: true,
          });
        }

        return {
          success: true,
          message: CHANGE_PASSWORD_SUCCESS_MESSAGE,
        };
      } catch (error) {
        return {
          success: false,
          message: toFriendlySupabaseMessage(
            error,
            "Unable to change your password right now. Please try again.",
          ),
        };
      }
    });
  },

  logout: async () => {
    return authOperationQueue.enqueue(async () => {
      authGeneration.bump();
      logoutInFlightTracker.begin();
      set({
        ...signedOutState(),
        isLogoutInFlight: true,
      });

      const signOutPromise = (async () => {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) {
          throw error;
        }
      })();

      try {
        const cleanupResult = await runLogoutCleanupWithTimeout(() => signOutPromise);

        if (cleanupResult === "completed") {
          return { success: true };
        }

        return {
          success: true,
          message:
            cleanupResult === "timed-out"
              ? "Signed out locally. Supabase session cleanup timed out."
              : "Signed out locally. Supabase session cleanup could not finish.",
        };
      } finally {
        logoutInFlightTracker.settle();
        set({ isLogoutInFlight: false });
      }
    });
  },

  clearError: () => set({ error: null }),
}));
