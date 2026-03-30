import Link from "next/link";

import { harasList } from "@/data/haras";

import { HarasCard } from "@/components/haras/haras-card";

export default function HomePage() {
  const totalCentres = harasList.reduce((sum, haras) => sum + haras.centres.length, 0);
  const heroStats = [`${harasList.length} haras`, `${totalCentres} centres`, "Accès sécurisé"];

  return (
    <main className="pb-12 lg:pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[820px]">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/haras/5654013-hd_1920_1080_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-white/70" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.62)_18%,rgba(255,255,255,0.54)_42%,rgba(255,255,255,0.78)_72%,rgba(255,255,255,0.94)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/96 via-white/80 to-white/0" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-white/0 via-white/88 to-white" />
        </div>

        <div className="container relative pt-16 lg:pt-24">
          <div className="relative mx-auto max-w-6xl">
            <div className="absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(193,139,56,0.16),transparent_68%)] blur-3xl" />

            <div className="relative mx-auto flex min-h-[68vh] max-w-5xl flex-col items-center justify-center text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-muted-foreground">
                Portail
              </p>

              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
                <span className="block">Plateforme de gestion</span>
                <span className="mt-3 block">et de saisie des données</span>
                <span className="mt-3 block text-[hsl(var(--accent))]">de reproduction</span>
              </h1>

              <p className="mx-auto mt-10 max-w-3xl text-lg leading-9 text-slate-600 sm:text-xl">
                Choisissez un haras pour ouvrir la saisie, accéder à vos espaces
                sécurisés et retrouver rapidement les modules métier essentiels.
              </p>

              <div className="mt-10 h-px w-28 bg-gradient-to-r from-transparent via-[hsl(var(--accent))] to-transparent opacity-55" />

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] font-semibold uppercase tracking-[0.24em] text-slate-700">
                {heroStats.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <Link
                  href="#haras"
                  className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-[hsl(var(--accent))]/35 bg-white/58 px-10 py-4 text-lg font-semibold text-[hsl(var(--accent))] shadow-[0_20px_40px_-30px_rgba(180,134,76,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/82"
                >
                  Accéder
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="haras" className="container space-y-8 pt-4 lg:pt-8">
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
