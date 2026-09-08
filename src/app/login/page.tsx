"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "login"
          ? { action: "login", email, password }
          : { action: "signup", email, password, name }
      ),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  function fillDemo(kind: "admin" | "sales") {
    if (kind === "admin") {
      setEmail("admin@nevermiss.app");
      setPassword("nevermiss2026");
    } else {
      setEmail("demo@nevermiss.app");
      setPassword("demo2026");
    }
    setMode("login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ink)] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(232,93,74,0.22),transparent_45%),radial-gradient(ellipse_at_90%_20%,rgba(61,90,128,0.35),transparent_50%),linear-gradient(165deg,#0c1222_0%,#141c2e_50%,#0a0f1a_100%)]"
      />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
          NeverMiss
        </Link>
        <h1 className="mt-8 font-display text-3xl font-semibold">
          {mode === "login" ? "Connexion" : "Créer un compte"}
        </h1>
        <p className="mt-2 text-sm text-white/65">
          Vos contacts et messages restent liés à votre compte — reconnectez-vous,
          tout est là.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">
                Prénom
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-white/15 bg-white/10 text-white"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-white/15 bg-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="border-white/15 bg-white/10 text-white"
            />
          </div>
          {error && <p className="text-sm text-[#ff8f7a]">{error}</p>}
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-[var(--accent-strong)] text-white hover:bg-[#d44d3a]"
          >
            {busy
              ? "…"
              : mode === "login"
                ? "Se connecter"
                : "Créer mon compte"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-white/60">
          {mode === "login" ? (
            <>
              Pas de compte ?{" "}
              <button
                type="button"
                className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
                onClick={() => setMode("signup")}
              >
                S’inscrire
              </button>
            </>
          ) : (
            <>
              Déjà inscrit ?{" "}
              <button
                type="button"
                className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
                onClick={() => setMode("login")}
              >
                Se connecter
              </button>
            </>
          )}
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
          <p className="mb-2 font-medium text-white/90">Démo sales — comptes prêts</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo("sales")}
              className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/15"
            >
              Sales · demo@nevermiss.app
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/15"
            >
              Admin · tout voir
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
