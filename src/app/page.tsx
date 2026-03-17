import Link from "next/link";
import { Building2, FileCheck2, LockKeyhole } from "lucide-react";

import { harasList } from "@/data/haras";

import { HarasCard } from "@/components/haras/haras-card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="container space-y-8 py-8 lg:space-y-10 lg:py-10">
      <section className="hero-panel soft-grid p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-5">
            <div className="inline-flex rounded-full border border-sky-200/80 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 backdrop-blur">
              Accès simplifié
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight lg:text-6xl">
                Saisir, vérifier et retrouver les données sans détour.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground lg:text-lg">
                La plateforme est organisée autour de trois actions essentielles:
                ouvrir un haras, se connecter avec votre mot de passe, puis saisir les juments, la
                reproduction et les naissances.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/haras/meknes">Commencer</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="#haras">Choisir un haras</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Building2,
                title: "1. Choisir un haras",
                text: "Entrez d'abord dans le haras correspondant a votre travail.",
              },
              {
                icon: LockKeyhole,
                title: "2. Valider l'accès",
                text: "Choisissez votre profil puis saisissez votre mot de passe.",
              },
              {
                icon: FileCheck2,
                title: "3. Faire votre saisie",
                text: "Les ecrans Juments, Reproduction et Production restent les points d'entree principaux.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-secondary/80 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="haras" className="space-y-4">
        <div className="space-y-2">
          <p className="section-caption">Choisir un haras</p>
          <h2 className="text-3xl font-semibold lg:text-4xl">
            Ouvrir directement le bon espace
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Chaque carte vous emmène vers le haras, puis vers son espace général ou
            vers l'un de ses centres.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {harasList.map((haras) => (
            <HarasCard key={haras.id} haras={haras} />
          ))}
        </div>
      </section>
    </main>
  );
}
