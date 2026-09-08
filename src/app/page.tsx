import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ink)] text-[#f7f4ef]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(232,93,74,0.22),transparent_45%),radial-gradient(ellipse_at_85%_25%,rgba(61,90,128,0.35),transparent_50%),linear-gradient(165deg,#0c1222_0%,#141c2e_55%,#0a0f1a_100%)]"
      />
      <div
        aria-hidden
        className="animate-drift animate-pulse-soft pointer-events-none absolute -right-24 top-20 h-[420px] w-[420px] rounded-full bg-[#e85d4a]/15 blur-3xl"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="font-display text-2xl font-semibold tracking-tight">
          NeverMiss
        </div>
        <nav className="hidden items-center gap-8 text-sm text-white/55 md:flex">
          <a href="#comment" className="hover:text-white">
            Comment ça marche
          </a>
          <a href="#tarifs" className="hover:text-white">
            Tarifs
          </a>
          <a href="#privacy" className="hover:text-white">
            Confidentialité
          </a>
        </nav>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ size: "default" }),
            "bg-[var(--accent-strong)] text-white hover:bg-[#d44d3a]"
          )}
        >
          Se connecter
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[82vh] w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h1 className="animate-rise font-display text-5xl leading-[1.02] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            NeverMiss
          </h1>
          <p className="animate-rise-delay-1 mt-5 max-w-xl text-lg text-white/70 sm:text-xl">
            Connectez-vous, choisissez vos relations, schedulez. Les messages
            partent en arrière-plan — sans ouvrir WhatsApp sous vos yeux.
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[var(--accent-strong)] px-6 text-base text-white hover:bg-[#d44d3a]"
              )}
            >
              Essayer maintenant
            </Link>
            <a
              href="#tarifs"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-white/20 bg-transparent px-6 text-base text-white hover:bg-white/5"
              )}
            >
              Voir les tarifs
            </a>
          </div>
        </div>

        <div className="animate-rise-delay-2 relative">
          <div className="absolute inset-0 rounded-[2rem] bg-[#e85d4a]/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#141c2e]/85 p-6 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-xs text-white/50">
              <span>Aujourd’hui · 09:00</span>
              <span className="rounded-md bg-[#e85d4a]/20 px-2 py-1 text-[#ffb4a8]">
                Background
              </span>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Joyeux anniversaire Sophie",
                  channel: "Email SMTP",
                  status: "Envoyé",
                },
                {
                  title: "WhatsApp · Marc",
                  channel: "Cloud API",
                  status: "Envoyé",
                },
                {
                  title: "Bravo pour le nouveau poste",
                  channel: "LinkedIn draft",
                  status: "Prêt",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-black/25 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-white/45">{item.channel}</p>
                  </div>
                  <span className="text-xs text-[#ffb4a8]">{item.status}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/45">
              Compte isolé · cron cloud · PC éteint OK.
            </p>
          </div>
        </div>
      </section>

      <section
        id="comment"
        className="relative z-10 border-t border-white/10 bg-black/20 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold">3 gestes</h2>
          <p className="mt-2 max-w-xl text-white/55">
            Interface minimale. Vous schedulez, NeverMiss envoie.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Connectez votre compte",
                d: "Email + mot de passe. Vos contacts restent liés à vous.",
              },
              {
                n: "2",
                t: "Ajoutez des relations",
                d: "Anniversaire, canaux, message perso. Pastilles Prénom / Nom — zéro {{}}.",
              },
              {
                n: "3",
                t: "Oubliez",
                d: "Le cron envoie via SMTP / WhatsApp Cloud API. Aucune fenêtre volée.",
              },
            ].map((s) => (
              <div key={s.n}>
                <p className="font-display text-4xl text-[var(--accent-strong)]">
                  {s.n}
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tarifs" className="relative z-10 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold">Tarifs</h2>
          <p className="mt-2 text-white/55">
            En démo, basculez entre les 3 plans depuis votre compte.
          </p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              {
                name: "Free",
                price: "0 €",
                desc: "5 contacts, email — valider le besoin.",
              },
              {
                name: "Pro",
                price: "20 €/mois",
                desc: "500 contacts, WhatsApp Cloud API, séquences.",
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Sur devis",
                desc: "LinkedIn drafts, admin, volume.",
              },
            ].map((p) => (
              <div
                key={p.name}
                className={cn(
                  "rounded-2xl border p-6",
                  p.highlight
                    ? "border-[var(--accent-strong)] bg-[var(--accent-strong)]/10"
                    : "border-white/10 bg-white/5"
                )}
              >
                <p className="text-sm text-white/55">{p.name}</p>
                <p className="mt-2 font-display text-3xl font-semibold">
                  {p.price}
                </p>
                <p className="mt-3 text-sm text-white/60">{p.desc}</p>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants(),
                    "mt-6 w-full",
                    p.highlight
                      ? "bg-[var(--accent-strong)] text-white hover:bg-[#d44d3a]"
                      : "bg-white text-[var(--ink)] hover:bg-white/90"
                  )}
                >
                  Ouvrir
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="privacy"
        className="relative z-10 border-t border-white/10 bg-black/25 py-16"
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-2xl font-semibold">
            Vos données vous appartiennent
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Comptes isolés, sessions httpOnly, mots de passe hashés (scrypt).
            Chaque utilisateur ne voit que ses contacts. Tokens canaux stockés
            sur le profil — pas de revente. Admin : vue agrégée pour piloter,
            pas pour lire vos messages privés.
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs text-white/40">
        NeverMiss · ne ratez plus jamais une relation
      </footer>
    </main>
  );
}
