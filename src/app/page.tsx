import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0e1512] text-[#e8fff4]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(124,255,178,0.18),transparent_50%),radial-gradient(ellipse_at_80%_30%,rgba(42,157,110,0.22),transparent_45%),linear-gradient(180deg,#0e1512_0%,#12201a_55%,#0a100e_100%)]"
      />
      <div
        aria-hidden
        className="animate-drift animate-pulse-soft pointer-events-none absolute -right-24 top-24 h-[420px] w-[420px] rounded-full bg-[#7cffb2]/15 blur-3xl"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="font-display text-2xl font-semibold tracking-tight">
          NeverMiss
        </div>
        <nav className="hidden items-center gap-8 text-sm text-[#a8b5ad] md:flex">
          <a href="#comment" className="hover:text-white">
            Comment ça marche
          </a>
          <a href="#tarifs" className="hover:text-white">
            Tarifs
          </a>
          <a href="#canaux" className="hover:text-white">
            Canaux
          </a>
        </nav>
        <Link
          href="/app"
          className={cn(
            buttonVariants({ size: "default" }),
            "bg-[#7cffb2] text-[#0e1512] hover:bg-[#9affc6]"
          )}
        >
          Ouvrir l’app
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[82vh] w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="animate-rise mb-4 text-sm font-medium uppercase tracking-[0.22em] text-[#7cffb2]">
            Relation commerciale automatisée
          </p>
          <h1 className="animate-rise-delay-1 font-display text-5xl leading-[1.02] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            NeverMiss
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-lg text-[#c8d9d0] sm:text-xl">
            Ne ratez plus jamais une relation. Anniversaires, Noël, bonne année,
            félicitations LinkedIn — programmés à l’avance, envoyés même PC
            éteint.
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/app"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#7cffb2] px-6 text-base text-[#0e1512] hover:bg-[#9affc6]"
              )}
            >
              Commencer gratuitement
            </Link>
            <a
              href="#tarifs"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-[#3a4f45] bg-transparent px-6 text-base text-[#e8fff4] hover:bg-white/5"
              )}
            >
              Voir les tarifs
            </a>
          </div>
        </div>

        <div className="animate-rise-delay-2 relative">
          <div className="absolute inset-0 rounded-[2rem] bg-[#7cffb2]/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#14201a]/80 p-6 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-xs text-[#a8b5ad]">
              <span>Aujourd’hui · 09:00</span>
              <span className="rounded-md bg-[#7cffb2]/15 px-2 py-1 text-[#7cffb2]">
                Auto
              </span>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Joyeux anniversaire Sophie",
                  channel: "Email",
                  status: "Envoyé",
                },
                {
                  title: "WhatsApp · Marc — J0",
                  channel: "WhatsApp",
                  status: "Prêt",
                },
                {
                  title: "Bravo pour le nouveau poste",
                  channel: "LinkedIn",
                  status: "Brouillon",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-[#a8b5ad]">{item.channel}</p>
                  </div>
                  <span className="text-xs text-[#7cffb2]">{item.status}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-[#a8b5ad]">
              Le moteur cron tourne dans le cloud. Vous dormez, NeverMiss
              souhaite à votre place.
            </p>
          </div>
        </div>
      </section>

      <section
        id="comment"
        className="relative z-10 border-t border-white/10 bg-[#0a100e] py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Un flux simple qui génère du cash
          </h2>
          <p className="mt-3 max-w-2xl text-[#a8b5ad]">
            Vertical claire : les commerciaux et freelances qui veulent rester
            top-of-mind sans y penser. Email fonctionne dès aujourd’hui.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Ajoutez vos contacts",
                d: "Anniversaire, email, téléphone, LinkedIn. Free = 5 contacts pour tester sur la famille.",
              },
              {
                n: "02",
                t: "Préparez vos messages",
                d: "Séquences multi-étapes : J-1 email, J0 WhatsApp, Noël, bonne année — textes 100 % custom.",
              },
              {
                n: "03",
                t: "Laissez tourner",
                d: "Le cron cloud envoie même PC éteint. Mode démo inclus ; SMTP pour l’email réel.",
              },
            ].map((step) => (
              <div key={step.n} className="border-t border-[#7cffb2]/30 pt-5">
                <p className="text-sm text-[#7cffb2]">{step.n}</p>
                <h3 className="mt-2 font-display text-xl font-semibold">
                  {step.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a8b5ad]">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="canaux" className="relative z-10 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Multi-canal, sans se ruiner
          </h2>
          <p className="mt-3 max-w-2xl text-[#a8b5ad]">
            WhatsApp Business API et n8n coûtent cher. NeverMiss priorise ce qui
            marche tout de suite, et garde les canaux premium pour Pro /
            Enterprise.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Gmail / Email",
                badge: "Dispo aujourd’hui",
                text: "Mode démo + SMTP (Gmail App Password, Brevo, Resend…). Envoi auto via cron.",
              },
              {
                title: "WhatsApp",
                badge: "Pro",
                text: "Liens wa.me prêts à envoyer (sans API payante). Business API optionnelle si vous l’avez.",
              },
              {
                title: "LinkedIn",
                badge: "Enterprise",
                text: "Brouillons de félicitations (nouveau poste). L’API LinkedIn est fermée — on prépare le message.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-white/10 bg-white/3 p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">
                    {c.title}
                  </h3>
                  <span className="rounded-md bg-[#7cffb2]/15 px-2 py-1 text-xs text-[#7cffb2]">
                    {c.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#a8b5ad]">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="tarifs"
        className="relative z-10 border-t border-white/10 bg-[#0a100e] py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Tarifs pensés pour encaisser vite
          </h2>
          <p className="mt-3 text-[#a8b5ad]">
            Free pour convertir. Pro à 20 €/mois pour les sales. Enterprise sur
            devis.
          </p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              {
                name: "Free",
                price: "0 €",
                desc: "Pour tester sur la famille",
                features: [
                  "5 contacts",
                  "1 séquence",
                  "Email (démo + SMTP)",
                  "Modèles anniversaire / fêtes",
                ],
                cta: "Essayer",
                highlight: false,
              },
              {
                name: "Pro",
                price: "20 €/mois",
                desc: "Pour un commercial solo",
                features: [
                  "500 contacts",
                  "20 séquences multi-messages",
                  "Email + WhatsApp (wa.me / API)",
                  "Cron cloud PC éteint",
                ],
                cta: "Passer Pro",
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Sur devis",
                desc: "Équipes & LinkedIn",
                features: [
                  "Multi-sales",
                  "LinkedIn (brouillons + process)",
                  "Limites élevées",
                  "Accompagnement custom",
                ],
                cta: "Contacter",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-[#7cffb2] bg-[#7cffb2]/8"
                    : "border-white/10 bg-white/3"
                }`}
              >
                <p className="text-sm text-[#a8b5ad]">{plan.name}</p>
                <p className="mt-2 font-display text-4xl font-semibold">
                  {plan.price}
                </p>
                <p className="mt-2 text-sm text-[#c8d9d0]">{plan.desc}</p>
                <ul className="mt-6 space-y-2 text-sm text-[#a8b5ad]">
                  {plan.features.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
                <Link
                  href="/app"
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "mt-8 w-full",
                    plan.highlight
                      ? "bg-[#7cffb2] text-[#0e1512] hover:bg-[#9affc6]"
                      : "bg-white/10 text-white hover:bg-white/15"
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-sm text-[#a8b5ad]">
        NeverMiss — ne ratez plus jamais une relation.
      </footer>
    </main>
  );
}
