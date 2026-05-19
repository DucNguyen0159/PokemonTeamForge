import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

import {
  createAuthGenerationGuard,
  createAuthOperationQueue,
  createLogoutInFlightTracker,
} from "@/lib/auth/auth-operations";
import { sanitizeUsername } from "@/lib/auth/auth-utils";
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
  await ensureProfileRecord(
    user.id,
    (user.user_metadata?.username as string | undefined) ?? fallbackUsername,
  );
  return await fetchUserProfile(user.id);
}

async function applyAuthStateChange(
  set: (partial: Partial<AuthStoreState>) => void,
  getState: () => AuthStoreState,
  nextSession: Session | null,
  eventGeneration: number,
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

  try {
    const profile = await ensureAndFetchUserProfile(nextSession.user, nextSession.user.email);
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
    supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const eventGeneration = authGeneration.get();
      await applyAuthStateChange(set, get, nextSession, eventGeneration);
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
      const operationGeneration = authGeneration.bump();

      set({ isLoading: true, error: null });

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

        const profile = await ensureAndFetchUserProfile(
          data.user,
          data.user.user_metadata?.username,
        );

        if (authGeneration.isStale(operationGeneration)) {
          return { success: false, message: "Sign in was interrupted. Please try again." };
        }

        set({
          ...applyAuthenticatedState(data.session, data.user, profile),
          isInitialized: true,
        });

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
        await signOutPromise;

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
