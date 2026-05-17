import { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: {
    default: "PokemonTeamForge | Build Smarter Pokémon Teams",
    template: "%s | PokemonTeamForge",
  },
  description:
    "Create Pokémon teams, analyze type coverage, browse battle-ready data, explore strategy presets, and export shareable team cards.",
  applicationName: "PokemonTeamForge",
  openGraph: {
    title: "PokemonTeamForge | Build Smarter Pokémon Teams",
    description:
      "Create Pokémon teams, analyze type coverage, browse battle-ready data, explore strategy presets, and export shareable team cards.",
    type: "website",
    siteName: "PokemonTeamForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "PokemonTeamForge | Build Smarter Pokémon Teams",
    description:
      "Build Pokémon teams, analyze coverage, explore strategies, and export shareable team cards.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="w-full flex-1">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
