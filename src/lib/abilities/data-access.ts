import type { AbilityDetail, AbilityTag } from "@/types/ability";
import type { AbilityListPayload } from "@/types/api";

type AbilityListQuery = {
  search?: string;
  tag?: AbilityTag;
  limit?: number;
};

type ApiPayload<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

export function buildAbilityListSearchParams(query: AbilityListQuery = {}): URLSearchParams {
  const params = new URLSearchParams();

  if (query.search && query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.tag) {
    params.set("tag", query.tag);
  }
  if (typeof query.limit === "number") {
    params.set("limit", String(query.limit));
  }

  return params;
}

export async function fetchAbilitiesFromApi(
  query: AbilityListQuery = { limit: 1000 },
): Promise<AbilityListPayload> {
  let response: Response;
  try {
    const params = buildAbilityListSearchParams(query);
    const suffix = params.toString();
    response = await fetch(`/api/abilities${suffix ? `?${suffix}` : ""}`);
  } catch {
    throw new Error("You seem to be offline. Please check your connection.");
  }

  let payload: ApiPayload<AbilityListPayload> | null = null;
  try {
    payload = (await response.json()) as ApiPayload<AbilityListPayload>;
  } catch {
    throw new Error("Ability data is temporarily unavailable. Please try again.");
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error?.message ?? "Unable to load abilities right now.");
  }

  return payload.data;
}

export async function fetchAbilityDetailFromApi(slug: string): Promise<AbilityDetail> {
  let response: Response;
  try {
    response = await fetch(`/api/abilities/${encodeURIComponent(slug)}`);
  } catch {
    throw new Error("You seem to be offline. Please check your connection.");
  }

  let payload: ApiPayload<AbilityDetail> | null = null;
  try {
    payload = (await response.json()) as ApiPayload<AbilityDetail>;
  } catch {
    throw new Error("Ability details are temporarily unavailable. Please try again.");
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error?.message ?? "Unable to load this ability right now.");
  }

  return payload.data;
}
