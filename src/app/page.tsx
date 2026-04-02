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
          <div className="portal-video-veil absolute inset-0" />
          <div className="portal-video-gradient absolute inset-0" />
          <div className="portal-video-top absolute inset-x-0 top-0 h-36" />
          <div className="portal-video-radial absolute inset-0" />
        </div>

        <div className="container relative pb-16 pt-16 lg:pb-24 lg:pt-24">
          <div className="relative mx-auto max-w-6xl">
            <div className="portal-center-glow absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 rounded-full blur-3xl" />

            <div className="relative mx-auto flex min-h-[68vh] max-w-5xl flex-col items-center justify-center text-center">
              <p className="portal-badge inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.42em]">
                Portail
              </p>

              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                <span className="block">Plateforme de gestion</span>
                <span className="mt-3 block">et de saisie des donnees</span>
                <span className="portal-highlight mt-3 block">de reproduction</span>
              </h1>

              <div className="mt-16 flex w-full max-w-3xl flex-col items-center space-y-8 lg:mt-20">
                <p className="portal-copy mx-auto max-w-3xl text-lg leading-9 sm:text-xl">
                  Choisissez un haras pour ouvrir la saisie, acceder a vos espaces
                  securises et retrouver rapidement les modules metier essentiels.
                </p>

                <div className="portal-rule h-px w-28 opacity-75" />

                <div className="flex justify-center">
                  <Link
                    href="#haras"
                    className="portal-cta inline-flex min-w-[220px] items-center justify-center rounded-full border px-10 py-4 text-lg font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"
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
          <h2 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
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
