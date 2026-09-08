"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlanId, SendTimeDefaults, Workspace } from "@/lib/types";
import { DEFAULT_SEND_TIMES, PLAN_LIMITS } from "@/lib/types";

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [times, setTimes] = useState<SendTimeDefaults>({ ...DEFAULT_SEND_TIMES });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (!data.workspace) {
        setWorkspace(null);
      } else {
        setWorkspace(data.workspace);
        setName(data.workspace.ownerName ?? "");
        setPhone(
          data.workspace.ownerPhone ||
            data.workspace.channels?.whatsapp?.ownerPhone ||
            ""
        );
        setLinkedin(
          data.workspace.ownerLinkedIn ||
            data.workspace.channels?.linkedin?.ownerProfileUrl ||
            ""
        );
        setTimes({
          ...DEFAULT_SEND_TIMES,
          ...(data.workspace.sendTimeDefaults ?? {}),
        });
      }
    } catch {
      setError("Impossible de charger les réglages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setPlan(plan: PlanId) {
    setBusy(true);
    setFlash(null);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-plan", plan }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur plan");
      return;
    }
    setFlash(`Plan ${PLAN_LIMITS[plan].label} activé — idéal pour la démo.`);
    await load();
  }

  async function saveProfile() {
    setBusy(true);
    setFlash(null);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set-profile",
        ownerName: name,
        ownerPhone: phone,
        ownerLinkedIn: linkedin,
        sendTimeDefaults: times,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur enregistrement");
      return;
    }
    setFlash("Identité et horaires enregistrés.");
    await load();
  }

  if (loading) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">Chargement…</p>
    );
  }

  if (!workspace) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        Connectez-vous pour accéder aux réglages.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Plan & réglages</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Changez de plan à la volée pour la démo sales. Compte :{" "}
          {workspace.ownerEmail}. Horaires = <strong>Europe/Paris</strong>.
        </p>
      </div>

      {flash && (
        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
          {flash}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Identité</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Votre nom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Votre WhatsApp</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 …"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Votre LinkedIn</Label>
            <Input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">
          Heures d’envoi par relation
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["ami", "Ami"],
              ["famille", "Famille"],
              ["travail", "Travail"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Input
                type="time"
                value={times[key]}
                onChange={(e) => setTimes({ ...times, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <Button
          onClick={() => void saveProfile()}
          disabled={busy}
          className="bg-[var(--ink)] text-white"
        >
          {busy ? "…" : "Enregistrer"}
        </Button>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {(Object.keys(PLAN_LIMITS) as PlanId[]).map((id) => {
          const plan = PLAN_LIMITS[id];
          const active = workspace.plan === id;
          return (
            <div
              key={id}
              className={`rounded-2xl border p-5 ${
                active
                  ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-white"
              }`}
            >
              <p className="text-sm text-[var(--muted-foreground)]">
                {plan.label}
              </p>
              <p className="mt-1 font-display text-3xl font-semibold">
                {plan.price}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {plan.description}
              </p>
              <ul className="mt-4 space-y-1 text-sm text-[var(--muted-foreground)]">
                <li>· {plan.contacts} contacts</li>
                <li>
                  · {plan.sequences} séquence{plan.sequences > 1 ? "s" : ""}
                </li>
                <li>· {plan.channels.join(", ")}</li>
              </ul>
              <Button
                className={`mt-5 w-full ${
                  active
                    ? "bg-[var(--accent-strong)] text-white"
                    : "bg-[var(--ink)] text-white"
                }`}
                disabled={busy || active}
                onClick={() => void setPlan(id)}
              >
                {active ? "Plan actuel" : `Essayer ${plan.label}`}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
