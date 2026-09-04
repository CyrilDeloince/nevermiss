"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AppStore } from "@/lib/types";
import { PLAN_LIMITS } from "@/lib/types";
import { formatFrDate } from "@/lib/messages-client";
import { cn } from "@/lib/utils";

export default function AppHomePage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("alex@agence.fr");
  const [name, setName] = useState("Alex Martin");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/store");
    const data = (await res.json()) as AppStore;
    setStore(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function bootstrap() {
    setBusy(true);
    setFlash(null);
    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bootstrap", email, name }),
    });
    await refresh();
    setBusy(false);
    setFlash("Espace créé — plan Free activé. Ajoutez un contact famille pour tester.");
  }

  async function runScheduler() {
    setBusy(true);
    setFlash(null);
    const schedule = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "schedule-upcoming" }),
    }).then((r) => r.json());
    const process = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "process-due" }),
    }).then((r) => r.json());
    await refresh();
    setBusy(false);
    setFlash(
      `Planifiés : ${schedule.created} · Traités : ${process.processed}`
    );
  }

  if (loading) {
    return <p className="text-sm text-[#5a6b63]">Chargement de votre espace…</p>;
  }

  if (!store?.workspace) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-3xl font-semibold text-[#0e1512]">
          Créer votre espace NeverMiss
        </h1>
        <p className="mt-2 text-[#5a6b63]">
          Free pour tester sur votre famille. Pro à 20 €/mois quand vous passez
          aux clients.
        </p>
        <div className="mt-8 space-y-4 rounded-2xl border border-[#d5e0da] bg-white p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Votre prénom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            onClick={() => void bootstrap()}
            disabled={busy}
            className="w-full bg-[#0e1512] text-[#e8fff4] hover:bg-[#1a2822]"
          >
            {busy ? "Création…" : "Lancer Free"}
          </Button>
        </div>
      </div>
    );
  }

  const plan = PLAN_LIMITS[store.workspace.plan];
  const upcoming = store.messages
    .filter((m) => m.status === "scheduled")
    .slice(0, 5);
  const recent = store.activity.slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#5a6b63]">
            Bonjour {store.workspace.ownerName}
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#0e1512]">
            Vue d’ensemble
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => void runScheduler()}
            disabled={busy}
            className="bg-[#7cffb2] text-[#0e1512] hover:bg-[#9affc6]"
          >
            Lancer le moteur maintenant
          </Button>
          <Link
            href="/app/contacts"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Ajouter un contact
          </Link>
        </div>
      </div>

      {flash && (
        <div className="rounded-xl border border-[#7cffb2]/40 bg-[#7cffb2]/15 px-4 py-3 text-sm text-[#0e1512]">
          {flash}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Plan",
            value: plan.label,
            sub: plan.price,
          },
          {
            label: "Contacts",
            value: `${store.contacts.length}/${plan.contacts}`,
            sub: "limite du plan",
          },
          {
            label: "À envoyer",
            value: String(
              store.messages.filter((m) => m.status === "scheduled").length
            ),
            sub: "dans la file",
          },
          {
            label: "Envoyés",
            value: String(store.messages.filter((m) => m.status === "sent").length),
            sub: "tous canaux",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#d5e0da] bg-white p-4"
          >
            <p className="text-xs uppercase tracking-wide text-[#5a6b63]">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-[#5a6b63]">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#d5e0da] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Prochains envois</h2>
            <Link href="/app/messages" className="text-sm text-[#2a9d6e]">
              Voir tout
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-[#5a6b63]">
              Aucun message programmé. Ajoutez un contact avec anniversaire, puis
              lancez le moteur.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((m) => {
                const contact = store.contacts.find((c) => c.id === m.contactId);
                return (
                  <li
                    key={m.id}
                    className="flex items-start justify-between gap-3 border-b border-[#e8efeb] pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {contact?.name ?? "Contact"} · {m.channel}
                      </p>
                      <p className="text-xs text-[#5a6b63] line-clamp-1">
                        {m.subject ?? m.body}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[#5a6b63]">
                      {formatFrDate(m.scheduledAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#d5e0da] bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Activité</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-[#5a6b63]">Pas encore d’activité.</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="text-[#0e1512]">{a.message}</p>
                  <p className="text-xs text-[#5a6b63]">
                    {formatFrDate(a.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-dashed border-[#2a9d6e] bg-[#7cffb2]/10 p-5">
        <h2 className="font-display text-lg font-semibold">PC éteint ?</h2>
        <p className="mt-2 text-sm text-[#5a6b63]">
          Appelez{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">
            GET /api/cron
          </code>{" "}
          toutes les heures via cron-job.org, Vercel Cron ou Railway. Les
          messages dus partent sans que votre ordinateur soit allumé.
        </p>
      </section>
    </div>
  );
}
