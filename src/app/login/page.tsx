"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { en } from "@/lib/i18n/en";

export default function LoginPage() {
  const router = useRouter();
  const t = en.login;
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
      setError(data.error || "Something went wrong");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  async function demoLogin() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        email: "demo@nevermiss.app",
        password: "demo2026",
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Demo login failed");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#16352b_0%,#1f4a3a_45%,#2d6a4f_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(212,167,74,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12), transparent 40%)",
          }}
        />
        <div className="relative">
          <Link href="/" className="font-display text-3xl font-semibold tracking-tight">
            {en.brand.name}
          </Link>
          <p className="mt-2 text-sm text-white/70">{en.brand.tagline}</p>
        </div>
        <div className="relative max-w-md space-y-4">
          <p className="font-display text-3xl leading-snug">{en.brand.promise}</p>
          <p className="text-sm leading-relaxed text-white/75">
            Your contacts stay in your account. Channel tokens live on your
            profile only. Admins see usage numbers, never your private messages.
          </p>
        </div>
        <p className="relative text-xs text-white/50">
          Demo: demo@nevermiss.app · demo2026
        </p>
      </div>

      <div className="flex items-center justify-center bg-[#f7f4ee] p-6">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#e4ddd0] bg-white p-8 shadow-sm">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#16352b]">
              {mode === "login" ? t.title : t.signupTitle}
            </h1>
            <p className="mt-1 text-sm text-[#5c6b63]">
              {mode === "login" ? t.subtitle : t.signupSubtitle}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Martin"
                  required
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>
            {error ? (
              <p className="text-sm text-[#b33b3b]">{error}</p>
            ) : null}
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-[#1f4a3a] text-white hover:bg-[#16352b]"
            >
              {busy ? "…" : mode === "login" ? t.submit : t.create}
            </Button>
          </form>

          <Button
            type="button"
            variant="outline"
            disabled={busy}
            className="w-full border-[#d4a74a] text-[#1f4a3a] hover:bg-[#fff8e8]"
            onClick={() => void demoLogin()}
          >
            {t.demo}
          </Button>

          <p className="text-center text-sm text-[#5c6b63]">
            {mode === "login" ? (
              <>
                {t.switchSignup}{" "}
                <button
                  type="button"
                  className="font-medium text-[#1f4a3a] underline"
                  onClick={() => setMode("signup")}
                >
                  {t.create}
                </button>
              </>
            ) : (
              <>
                {t.switchLogin}{" "}
                <button
                  type="button"
                  className="font-medium text-[#1f4a3a] underline"
                  onClick={() => setMode("login")}
                >
                  {t.submit}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
