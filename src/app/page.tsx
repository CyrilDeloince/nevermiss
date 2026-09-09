import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { copy } from "@/lib/i18n/en";
import { JardinMark } from "@/components/jardin-mark";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ink)] text-[#f4f7f2]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(122,158,126,0.28),transparent_48%),radial-gradient(ellipse_at_88%_18%,rgba(201,162,92,0.18),transparent_45%),linear-gradient(165deg,#0f1a14_0%,#15241c_55%,#0b120e_100%)]"
      />
      <div
        aria-hidden
        className="animate-drift animate-pulse-soft pointer-events-none absolute -right-24 top-16 h-[420px] w-[420px] rounded-full bg-[#7a9e7e]/18 blur-3xl"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight">
          <JardinMark className="size-9" />
          {copy.brand}
        </div>
        <nav className="hidden items-center gap-8 text-sm text-white/55 md:flex">
          <a href="#how" className="hover:text-white">
            {copy.nav.how}
          </a>
          <a href="#pricing" className="hover:text-white">
            {copy.nav.pricing}
          </a>
          <a href="#privacy" className="hover:text-white">
            {copy.nav.privacy}
          </a>
        </nav>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ size: "default" }),
            "bg-[#c9a25c] text-[#0f1a14] hover:bg-[#d4b06e]"
          )}
        >
          {copy.nav.login}
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[82vh] w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="animate-rise mb-3 text-sm tracking-wide text-[#c9a25c]">
            {copy.tagline}
          </p>
          <h1 className="animate-rise-delay-1 font-display text-5xl leading-[1.02] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            {copy.brand}
          </h1>
          <p className="animate-rise-delay-1 mt-3 font-display text-xl text-[#e6d3a4] sm:text-2xl">
            {copy.citation}
          </p>
          <p className="animate-rise-delay-2 mt-2 text-xs tracking-wide text-white/40">
            {copy.citationSource}
          </p>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-lg text-white/70 sm:text-xl">
            {copy.heroSupport}
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#c9a25c] px-6 text-base text-[#0f1a14] hover:bg-[#d4b06e]"
              )}
            >
              {copy.nav.try}
            </Link>
            <a
              href="#pricing"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-white/20 bg-transparent px-6 text-base text-white hover:bg-white/5"
              )}
            >
              {copy.nav.pricingCta}
            </a>
          </div>
        </div>

        <div className="animate-rise-delay-2 relative">
          <div className="absolute inset-0 rounded-[2rem] bg-[#7a9e7e]/15 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#15241c]/90 p-6 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-xs text-white/50">
              <span className="flex items-center gap-2">
                <JardinMark className="size-5" />
                Today · garden view
              </span>
              <span className="rounded-md bg-[#c9a25c]/20 px-2 py-1 text-[#e6d3a4]">
                Quiet care
              </span>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Birthday wish · Sophie",
                  channel: "WhatsApp + Email",
                  status: "Sent",
                },
                {
                  title: "Holiday note · client circle",
                  channel: "Discord",
                  status: "Queued",
                },
                {
                  title: "New role congratulations",
                  channel: "LinkedIn draft",
                  status: "Ready",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-white/45">{item.channel}</p>
                  </div>
                  <span className="text-xs text-[#e6d3a4]">{item.status}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/45">
              Keep the relationships that already chose you. New growth follows.
            </p>
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 border-t border-white/10 bg-black/20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold">{copy.howTitle}</h2>
          <p className="mt-2 max-w-xl text-white/55">{copy.howSupport}</p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {copy.steps.map((s) => (
              <div key={s.n}>
                <p className="font-display text-4xl text-[#c9a25c]">{s.n}</p>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold">{copy.pricingTitle}</h2>
          <p className="mt-2 text-white/55">{copy.pricingSupport}</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {copy.plans.map((p) => (
              <div
                key={p.name}
                className={cn(
                  "rounded-2xl border p-6",
                  p.highlight
                    ? "border-[#c9a25c] bg-[#c9a25c]/10"
                    : "border-white/10 bg-white/5"
                )}
              >
                <p className="text-sm text-white/55">{p.name}</p>
                <p className="mt-2 font-display text-3xl font-semibold">{p.price}</p>
                <p className="mt-3 text-sm text-white/60">{p.desc}</p>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants(),
                    "mt-6 w-full",
                    p.highlight
                      ? "bg-[#c9a25c] text-[#0f1a14] hover:bg-[#d4b06e]"
                      : "bg-white text-[var(--ink)] hover:bg-white/90"
                  )}
                >
                  Open
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
          <h2 className="font-display text-2xl font-semibold">{copy.privacyTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            {copy.privacyBody}
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs text-white/40">
        {copy.footer}
      </footer>
    </main>
  );
}
