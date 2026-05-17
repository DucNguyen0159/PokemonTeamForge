import type { Item } from "@/types/item";
import type { ItemListPayload } from "@/types/api";

type ApiPayload<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

type ItemListQuery = {
  search?: string;
  competitiveOnly?: boolean;
  limit?: number;
};

export function buildItemListSearchParams(query: ItemListQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }
  if (typeof query.competitiveOnly === "boolean") {
    params.set("competitiveOnly", String(query.competitiveOnly));
  }
  if (typeof query.limit === "number") {
    params.set("limit", String(query.limit));
  }

  return params;
}

export async function fetchItemsFromApi(query: ItemListQuery = {}): Promise<ItemListPayload> {
  let response: Response;
  try {
    const params = buildItemListSearchParams(query);
    response = await fetch(`/api/items?${params.toString()}`);
  } catch {
    throw new Error("You seem to be offline. Please check your connection.");
  }

  let payload: ApiPayload<ItemListPayload> | null = null;
  try {
    payload = (await response.json()) as ApiPayload<ItemListPayload>;
  } catch {
    throw new Error("Item data is temporarily unavailable. Please try again.");
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error?.message ?? "Unable to load items right now.");
  }

  return payload.data;
}

export async function fetchCompetitiveItemsFromApi(): Promise<Item[]> {
  const payload = await fetchItemsFromApi({ competitiveOnly: true, limit: 1000 });
  return payload.items;
}
