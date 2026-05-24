import type { MetadataRoute } from "next";

import { getSiteConfig } from "@/lib/site/site-config";

const PUBLIC_ROUTES = [
  "",
  "/builder",
  "/pokedex",
  "/abilities",
  "/strategies",
  "/team-card",
  "/help",
  "/about",
  "/credits",
  "/privacy",
  "/terms",
  "/contact",
  "/support",
  "/login",
  "/register",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl } = getSiteConfig();
  const base = siteUrl.replace(/\/$/, "");
  const lastModified = new Date("2026-06-01");

  return PUBLIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" || path === "/builder" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/builder" ? 0.9 : 0.7,
  }));
}
