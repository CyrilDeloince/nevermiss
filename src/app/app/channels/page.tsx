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
      <p className="text-sm text-[#5a6b63]">
        Créez d’abord votre espace depuis la vue d’ensemble.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Canaux</h1>
        <p className="mt-1 text-sm text-[#5a6b63]">
          Email fonctionne aujourd’hui. WhatsApp sans API payante via wa.me.
          LinkedIn en brouillon (API fermée).
        </p>
      </div>

      {flash && (
        <div className="rounded-xl bg-[#7cffb2]/15 px-4 py-3 text-sm">{flash}</div>
      )}

      <section className="space-y-4 rounded-2xl border border-[#d5e0da] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Email / Gmail</h2>
          <span className="rounded-md bg-[#7cffb2]/20 px-2 py-1 text-xs text-[#0e1512]">
            Dispo Free
          </span>
        </div>
        <p className="text-sm text-[#5a6b63]">
          Mode démo = simulation + journal d’activité. Mode SMTP = envoi réel
          (mot de passe d’application Gmail, Brevo, Resend SMTP…).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Mode</Label>
            <select
              className="h-9 w-full rounded-lg border border-[#d5e0da] px-3 text-sm"
              value={channels.email.mode}
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
              <option value="demo">Démo (sans SMTP)</option>
              <option value="smtp">SMTP réel</option>
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
                      host: channels.email.smtp?.host ?? "",
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
                ["pass", "Password / App password"],
                ["fromEmail", "From email"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  type={key === "pass" ? "password" : "text"}
                  value={String(
                    channels.email.smtp?.[
                      key === "port" ? "port" : key
                    ] ?? (key === "port" ? 587 : "")
                  )}
                  onChange={(e) =>
                    setChannels({
                      ...channels,
                      email: {
                        ...channels.email,
                        smtp: {
                          host: channels.email.smtp?.host ?? "",
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

      <section className="space-y-4 rounded-2xl border border-[#d5e0da] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">WhatsApp</h2>
          <span className="rounded-md bg-[#e8efeb] px-2 py-1 text-xs">Pro</span>
        </div>
        <p className="text-sm text-[#5a6b63]">
          <strong>wa.me</strong> : NeverMiss prépare le lien + message — un clic
          pour envoyer, sans Meta Business payant ni n8n allumé.{" "}
          <strong>Business API</strong> : envoi 100 % auto si vous avez déjà un
          compte.
        </p>
        <div className="space-y-2">
          <Label>Mode</Label>
          <select
            className="h-9 w-full max-w-md rounded-lg border border-[#d5e0da] px-3 text-sm"
            value={channels.whatsapp.mode}
            onChange={(e) =>
              setChannels({
                ...channels,
                whatsapp: {
                  ...channels.whatsapp,
                  enabled: true,
                  mode: e.target.value as "wa_me" | "business_api",
                },
              })
            }
          >
            <option value="wa_me">wa.me (recommandé, gratuit)</option>
            <option value="business_api">WhatsApp Business API</option>
          </select>
        </div>
        {channels.whatsapp.mode === "business_api" && (
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
                      phoneNumberId: e.target.value,
                    },
                  })
                }
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
                      businessToken: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-[#d5e0da] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">LinkedIn</h2>
          <span className="rounded-md bg-[#e8efeb] px-2 py-1 text-xs">
            Enterprise
          </span>
        </div>
        <p className="text-sm text-[#5a6b63]">
          L’API messaging LinkedIn est quasi inaccessible. NeverMiss génère le
          texte « Bravo pour ton nouveau poste… » et ouvre le profil — vous
          collez en 5 secondes. C’est le levier Enterprise honnête et vendable.
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

      <Button
        onClick={() => void save()}
        disabled={busy}
        className="bg-[#0e1512] text-[#e8fff4]"
      >
        Enregistrer les canaux
      </Button>
    </div>
  );
}
