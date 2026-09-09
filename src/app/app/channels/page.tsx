"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChannelSettings, Workspace } from "@/lib/types";

export default function ChannelsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [channels, setChannels] = useState<ChannelSettings | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/settings").then((r) => r.json());
    if (res.error) return;
    setWorkspace(res.workspace);
    setChannels(res.workspace?.channels ?? null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!channels) return;
    setBusy(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-channels", channels }),
    });
    setBusy(false);
    setFlash("Canaux enregistrés");
    await load();
  }

  if (!workspace || !channels) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">Chargement…</p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Canaux</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Objectif : envoi en arrière-plan, sans ouvrir WhatsApp ni Gmail sous
          vos yeux. SMTP + WhatsApp Cloud API (Meta).
        </p>
      </div>

      {flash && (
        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
          {flash}
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Email (silencieux)</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Mode démo = simulation pour la démo sales. Mode SMTP = vrai envoi
          automatique (Gmail app password, Brevo, Resend…).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Mode</Label>
            <select
              className="h-9 w-full rounded-lg border border-[var(--border)] px-3 text-sm"
              value={channels.email.mode === "gmail_compose" ? "demo" : channels.email.mode}
              onChange={(e) =>
                setChannels({
                  ...channels,
                  email: {
                    ...channels.email,
                    mode: e.target.value as "demo" | "smtp",
                  },
                })
              }
            >
              <option value="demo">Démo (simulation)</option>
              <option value="smtp">SMTP réel (background)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Nom expéditeur</Label>
            <Input
              value={channels.email.smtp?.fromName ?? workspace.ownerName}
              onChange={(e) =>
                setChannels({
                  ...channels,
                  email: {
                    ...channels.email,
                    smtp: {
                      host: channels.email.smtp?.host ?? "smtp.gmail.com",
                      port: channels.email.smtp?.port ?? 587,
                      secure: channels.email.smtp?.secure ?? false,
                      user: channels.email.smtp?.user ?? "",
                      pass: channels.email.smtp?.pass ?? "",
                      fromEmail: channels.email.smtp?.fromEmail ?? "",
                      fromName: e.target.value,
                    },
                  },
                })
              }
            />
          </div>
        </div>
        {channels.email.mode === "smtp" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["host", "Host (smtp.gmail.com)"],
                ["port", "Port (587)"],
                ["user", "User"],
                ["pass", "App password"],
                ["fromEmail", "From email"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  type={key === "pass" ? "password" : "text"}
                  value={String(
                    channels.email.smtp?.[key === "port" ? "port" : key] ??
                      (key === "port" ? 587 : "")
                  )}
                  onChange={(e) =>
                    setChannels({
                      ...channels,
                      email: {
                        ...channels.email,
                        smtp: {
                          host: channels.email.smtp?.host ?? "smtp.gmail.com",
                          port: channels.email.smtp?.port ?? 587,
                          secure: channels.email.smtp?.secure ?? false,
                          user: channels.email.smtp?.user ?? "",
                          pass: channels.email.smtp?.pass ?? "",
                          fromName:
                            channels.email.smtp?.fromName ?? workspace.ownerName,
                          fromEmail: channels.email.smtp?.fromEmail ?? "",
                          [key]:
                            key === "port"
                              ? Number(e.target.value)
                              : e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">
          WhatsApp Cloud API (silencieux)
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Meta n’autorise pas d’envoyer WhatsApp en silence sans Business API.
          Collez votre Phone Number ID + token Meta — les messages partent en
          arrière-plan, sans onglet, sans Entrée.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Phone Number ID</Label>
            <Input
              value={channels.whatsapp.phoneNumberId ?? ""}
              onChange={(e) =>
                setChannels({
                  ...channels,
                  whatsapp: {
                    ...channels.whatsapp,
                    mode: "business_api",
                    phoneNumberId: e.target.value,
                  },
                })
              }
              placeholder="Depuis Meta Developers"
            />
          </div>
          <div className="space-y-2">
            <Label>Access Token</Label>
            <Input
              type="password"
              value={channels.whatsapp.businessToken ?? ""}
              onChange={(e) =>
                setChannels({
                  ...channels,
                  whatsapp: {
                    ...channels.whatsapp,
                    mode: "business_api",
                    businessToken: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Votre numéro (identité)</Label>
            <Input
              value={channels.whatsapp.ownerPhone ?? workspace.ownerPhone ?? ""}
              onChange={(e) =>
                setChannels({
                  ...channels,
                  whatsapp: {
                    ...channels.whatsapp,
                    ownerPhone: e.target.value,
                  },
                })
              }
              placeholder="+33 6 …"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">LinkedIn</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          LinkedIn messaging API is closed. Jardin prepares the draft text; you
          le postez en un copier-coller. Pas de scraping, pas de popup forcée.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={channels.linkedin.enabled}
            onChange={(e) =>
              setChannels({
                ...channels,
                linkedin: {
                  ...channels.linkedin,
                  enabled: e.target.checked,
                  mode: "manual",
                },
              })
            }
          />
          Activer les brouillons LinkedIn
        </label>
      </section>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)] p-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
        <p className="font-medium text-[var(--foreground)]">
          Vos données vous appartiennent
        </p>
        <p className="mt-1">
          Comptes isolés, sessions sécurisées, mots de passe hashés. Tokens
          canaux stockés sur votre profil uniquement. Pas de revente.
        </p>
      </div>

      <Button
        onClick={() => void save()}
        disabled={busy}
        className="bg-[var(--ink)] text-white"
      >
        Enregistrer les canaux
      </Button>
    </div>
  );
}
