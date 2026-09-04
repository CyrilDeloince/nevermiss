"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PlanId, Workspace } from "@/lib/types";
import { PLAN_LIMITS } from "@/lib/types";

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/settings").then((r) => r.json());
    setWorkspace(res.workspace);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setPlan(plan: PlanId) {
    setBusy(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-plan", plan }),
    });
    setFlash(
      plan === "pro"
        ? "Plan Pro activé (démo locale). Branchez Stripe Checkout pour encaisser pour de vrai."
        : `Plan ${plan} activé`
    );
    await load();
    setBusy(false);
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
          Compte : {workspace.ownerName} ({workspace.ownerEmail})
        </p>
      </div>

      {flash && (
        <div className="rounded-xl bg-[#7cffb2]/15 px-4 py-3 text-sm">{flash}</div>
      )}

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

      <section className="rounded-2xl border border-[#d5e0da] bg-white p-5 text-sm text-[#5a6b63]">
        <h2 className="font-display text-lg font-semibold text-[#0e1512]">
          Encaisser pour de vrai
        </h2>
        <p className="mt-2">
          Pour monétiser : branchez Stripe Checkout sur le bouton Pro (price =
          20 €/mois). Les limites Free → Pro sont déjà dans le code. Déployez
          sur Railway / Fly / VPS + cron horaire sur{" "}
          <code className="rounded bg-[#f4f7f5] px-1">/api/cron</code> pour que
          ça tourne PC éteint.
        </p>
        <p className="mt-3">
          Variable optionnelle :{" "}
          <code className="rounded bg-[#f4f7f5] px-1">CRON_SECRET</code> pour
          sécuriser le cron.
        </p>
      </section>
    </div>
  );
}
