import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { PlatformTopbar } from "@/components/layout/platform-topbar";

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
    "Prototype front-end Next.js pour la saisie métier des données de reproduction équine, structuré par haras et centres.",
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
          <PlatformTopbar />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
