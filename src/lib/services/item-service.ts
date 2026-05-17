import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Item, ItemCompetitiveGroup, ItemTag } from "@/types/item";
import type { ItemListPayload } from "@/types/api";

type ItemRow = {
  id: number;
  slug: string;
  name: string;
  category: string | null;
  competitive_group: string | null;
  competitive_group_order: number | null;
  sort_order: number | null;
  description: string | null;
  short_effect: string | null;
  icon_url: string | null;
  icon_storage_path: string | null;
  tags: string[] | null;
  is_competitive: boolean | null;
};

export interface ItemListQuery {
  search?: string;
  competitiveOnly?: boolean;
  limit?: number;
}

const DEFAULT_ITEM_LIMIT = 500;
const FALLBACK_ITEMS: Item[] = [
  {
    id: 1,
    name: "Leftovers",
    slug: "leftovers",
    description: "Restores 1/16 of max HP each turn.",
    tags: ["recovery"],
  },
  {
    id: 2,
    name: "Choice Band",
    slug: "choice-band",
    description: "Boosts Attack by 1.5x. Locks into one move.",
    tags: ["choice_item", "damage_boost"],
  },
  {
    id: 3,
    name: "Choice Scarf",
    slug: "choice-scarf",
    description: "Boosts Speed by 1.5x. Locks into one move.",
    tags: ["choice_item", "speed_boost"],
  },
  {
    id: 4,
    name: "Choice Specs",
    slug: "choice-specs",
    description: "Boosts Sp. Atk by 1.5x. Locks into one move.",
    tags: ["choice_item", "damage_boost"],
  },
  {
    id: 5,
    name: "Focus Sash",
    slug: "focus-sash",
    description: "Survives a KO hit from full HP with 1 HP.",
    tags: ["focus_sash"],
  },
  {
    id: 6,
    name: "Life Orb",
    slug: "life-orb",
    description: "Boosts power of moves by 1.3x; deals recoil.",
    tags: ["damage_boost"],
  },
];
let cachedItems: Item[] | null = null;

function hasSupabaseServerEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function toItem(row: ItemRow): Item {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    competitiveGroup: (row.competitive_group ?? "other") as ItemCompetitiveGroup,
    competitiveGroupOrder: row.competitive_group_order ?? 900,
    sortOrder: row.sort_order ?? 0,
    description: row.description ?? undefined,
    shortEffect: row.short_effect,
    iconUrl: row.icon_url,
    iconStoragePath: row.icon_storage_path,
    tags: (row.tags ?? []) as ItemTag[],
    isCompetitive: row.is_competitive ?? false,
  };
}

function normalizeSearch(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function filterAndSortItems(items: Item[], query: ItemListQuery): Item[] {
  const search = normalizeSearch(query.search);
  const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_ITEM_LIMIT, 1000));

  return items
    .filter((item) => {
      if (query.competitiveOnly !== false && item.isCompetitive === false) {
        return false;
      }
      if (!search) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(search) ||
        item.slug.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      const group = (a.competitiveGroupOrder ?? 900) - (b.competitiveGroupOrder ?? 900);
      if (group !== 0) return group;

      const sort = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (sort !== 0) return sort;

      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

function fallbackItems(query: ItemListQuery): ItemListPayload {
  const items = filterAndSortItems(
    FALLBACK_ITEMS.map((item) => ({
      ...item,
      competitiveGroup: "battle" as const,
      competitiveGroupOrder: 10,
      sortOrder: 0,
      isCompetitive: true,
    })),
    query,
  );

  return {
    items,
    total: items.length,
  };
}

export async function getItems(query: ItemListQuery = {}): Promise<ItemListPayload> {
  if (!hasSupabaseServerEnv()) {
    return fallbackItems(query);
  }

  if (!cachedItems) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("items")
      .select(
        "id, slug, name, category, competitive_group, competitive_group_order, sort_order, description, short_effect, icon_url, icon_storage_path, tags, is_competitive",
      )
      .order("competitive_group_order", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackItems(query);
    }

    cachedItems = (data as ItemRow[]).map(toItem);
  }

  const items = filterAndSortItems(cachedItems, query);
  return {
    items,
    total: items.length,
  };
}

export async function getItemByName(name: string): Promise<Item | null> {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const { items } = await getItems({ competitiveOnly: false, limit: 1000 });

  return (
    items.find(
      (item) =>
        item.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized ||
        item.slug.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized,
    ) ?? null
  );
}
