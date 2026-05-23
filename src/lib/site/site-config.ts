export type SiteConfig = {
  contactEmail: string;
  siteUrl: string;
  githubProfileUrl: string;
  githubRepoUrl: string;
  kofiUrl: string;
  githubSponsorsUrl: string;
};

function trimEnv(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function getSiteConfig(): SiteConfig {
  return {
    contactEmail:
      trimEnv(process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL) || "info@poketeamforge.com",
    siteUrl: trimEnv(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000",
    githubProfileUrl:
      trimEnv(process.env.NEXT_PUBLIC_GITHUB_PROFILE_URL) ||
      "https://github.com/DucNguyen0159",
    githubRepoUrl:
      trimEnv(process.env.NEXT_PUBLIC_GITHUB_REPO_URL) ||
      "https://github.com/DucNguyen0159/PokemonTeamForge",
    kofiUrl: trimEnv(process.env.NEXT_PUBLIC_KOFI_URL),
    githubSponsorsUrl: trimEnv(process.env.NEXT_PUBLIC_GITHUB_SPONSORS_URL),
  };
}
