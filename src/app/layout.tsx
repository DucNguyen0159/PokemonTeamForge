import { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
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
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
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
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
            <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-18rem] right-[-12rem] h-[34rem] w-[34rem] rounded-full bg-sky-500/8 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.18]" />
          </div>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="w-full flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
