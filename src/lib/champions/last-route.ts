const STORAGE_KEY = "pokemon-team-forge-champions-last-route";

export type ChampionsLastRoute = {
  href: string;
  label: string;
  timestamp: number;
};

export function saveChampionsLastRoute(href: string, label: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload: ChampionsLastRoute = {
      href,
      label,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage failures
  }
}

export function readChampionsLastRoute(): ChampionsLastRoute | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as ChampionsLastRoute;
  } catch {
    return null;
  }
}
