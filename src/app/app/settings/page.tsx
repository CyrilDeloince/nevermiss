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
  const [email, setEmail] = useState("");
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
        setEmail(data.workspace.ownerEmail ?? "");
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
    setFlash(
      plan === "pro"
        ? "Plan Pro activé. WhatsApp & séquences débloqués."
        : `Plan ${plan} activé`
    );
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
        ownerEmail: email,
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
    setFlash(
      "Identité enregistrée — WhatsApp, email et LinkedIn sont connectés à votre profil."
    );
    await load();
  }

  if (loading) {
    return <p className="text-sm text-[#5a6b63]">Chargement des réglages…</p>;
  }

  if (!workspace) {
    return (
      <p className="text-sm text-[#5a6b63]">
        Créez d’abord votre espace depuis la vue d’ensemble.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Plan & réglages</h1>
        <p className="mt-1 text-sm text-[#5a6b63]">
          Votre identité d’envoi + horaires selon ami / famille / travail.
        </p>
      </div>

      {flash && (
        <div className="rounded-xl bg-[#7cffb2]/15 px-4 py-3 text-sm text-[#0e1512]">
          {flash}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-[#d5e0da] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">
          Mon identité (expéditeur)
        </h2>
        <p className="text-sm text-[#5a6b63]">
          C’est <strong>votre</strong> WhatsApp, email et LinkedIn — pas ceux du
          contact. Les vœux partent comme venant de vous.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Votre nom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Votre email (Gmail)</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@gmail.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Votre WhatsApp</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 52 62 33 28"
            />
          </div>
          <div className="space-y-2">
            <Label>Votre LinkedIn</Label>
            <Input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#d5e0da] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">
          Heures d’envoi par type de relation
        </h2>
        <p className="text-sm text-[#5a6b63]">
          Un ami à 10h30, la famille à 9h, un client à 8h45 — pas le même moment.
          Chaque contact peut aussi avoir son heure perso.
        </p>
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
          className="bg-[#0e1512] text-[#e8fff4]"
        >
          {busy ? "Enregistrement…" : "Enregistrer identité & horaires"}
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
                  ? "border-[#2a9d6e] bg-[#7cffb2]/10"
                  : "border-[#d5e0da] bg-white"
              }`}
            >
              <p className="text-sm text-[#5a6b63]">{plan.label}</p>
              <p className="mt-1 font-display text-3xl font-semibold">
                {plan.price}
              </p>
              <p className="mt-2 text-sm text-[#5a6b63]">{plan.description}</p>
              <ul className="mt-4 space-y-1 text-sm text-[#5a6b63]">
                <li>· {plan.contacts} contacts</li>
                <li>
                  · {plan.sequences} séquence{plan.sequences > 1 ? "s" : ""}
                </li>
                <li>· Canaux : {plan.channels.join(", ")}</li>
              </ul>
              <Button
                className={`mt-5 w-full ${
                  active
                    ? "bg-[#2a9d6e] text-white"
                    : "bg-[#0e1512] text-[#e8fff4]"
                }`}
                disabled={busy || active}
                onClick={() => void setPlan(id)}
              >
                {active ? "Plan actuel" : `Activer ${plan.label}`}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
