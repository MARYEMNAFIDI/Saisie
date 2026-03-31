import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";

import { BackToTopButton } from "@/components/layout/back-to-top-button";
import { PlatformTopbar } from "@/components/layout/platform-topbar";
import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Plateforme de Saisie Reproduction Equine",
  description:
    "Prototype front-end Next.js pour la saisie metier des donnees de reproduction equine, structure par haras et centres.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable}`}>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <PlatformTopbar />
            <div className="flex-1">{children}</div>
            <BackToTopButton />
            <footer className="border-t border-[color:var(--topbar-border)] bg-[var(--topbar-bg)]">
              <div className="container py-5 text-center text-sm text-foreground/70">
                &copy; 2026 SOREC - Societe Royale d&apos;Encouragement du Cheval.
                Tous droits reserves. | Plateforme de Saisie
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
