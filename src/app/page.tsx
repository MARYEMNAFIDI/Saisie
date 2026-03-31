import Link from "next/link";

import { harasList } from "@/data/haras";

import { HarasCard } from "@/components/haras/haras-card";

export default function HomePage() {
  return (
    <main className="pb-12 lg:pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[820px]">
          <video className="h-full w-full object-cover" autoPlay muted loop playsInline>
            <source src="/haras/5654013-hd_1920_1080_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/48" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.84)_0%,rgba(2,6,23,0.58)_18%,rgba(2,6,23,0.5)_42%,rgba(2,6,23,0.72)_74%,rgba(2,6,23,0.9)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/88 via-black/56 to-black/0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(245,158,11,0.12),transparent_18%)]" />
        </div>

        <div className="container relative pb-16 pt-16 lg:pb-24 lg:pt-24">
          <div className="relative mx-auto max-w-6xl">
            <div className="absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(193,139,56,0.16),transparent_68%)] blur-3xl" />

            <div className="relative mx-auto flex min-h-[68vh] max-w-5xl flex-col items-center justify-center text-center">
              <p className="inline-flex items-center rounded-full border border-[#d8b07a]/45 bg-[linear-gradient(180deg,rgba(246,232,212,0.94),rgba(226,191,143,0.9))] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.42em] text-[#5f3f1b] shadow-[0_18px_40px_-28px_rgba(191,138,74,0.62)]">
                Portail
              </p>

              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                <span className="block">Plateforme de gestion</span>
                <span className="mt-3 block">et de saisie des donnees</span>
                <span className="mt-3 block text-amber-300">de reproduction</span>
              </h1>

              <div className="mt-16 flex w-full max-w-3xl flex-col items-center space-y-8 lg:mt-20">
                <p className="mx-auto max-w-3xl text-lg leading-9 text-white/80 sm:text-xl">
                  Choisissez un haras pour ouvrir la saisie, acceder a vos espaces
                  securises et retrouver rapidement les modules metier essentiels.
                </p>

                <div className="h-px w-28 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-75" />

                <div className="flex justify-center">
                  <Link
                    href="#haras"
                    className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-white/16 bg-black/36 px-10 py-4 text-lg font-semibold text-white shadow-[0_24px_46px_-30px_rgba(2,6,23,0.72)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/52"
                  >
                    Acceder
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="haras" className="container space-y-8 pt-10 lg:pt-16">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="section-caption">Choisir un haras</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">
            Ouvrir directement le bon espace
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground">
            Chaque carte ouvre le haras puis ses espaces de travail, dans une interface
            plus directe et plus lisible.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {harasList.map((haras) => (
            <HarasCard key={haras.id} haras={haras} />
          ))}
        </div>
      </section>
    </main>
  );
}
