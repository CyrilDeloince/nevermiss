"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Channel, Occasion, Sequence, Template } from "@/lib/types";

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("Séquence Noël");
  const [occasion, setOccasion] = useState<Occasion>("christmas");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [seqs, tpls] = await Promise.all([
      fetch("/api/sequences").then((r) => r.json()),
      fetch("/api/templates").then((r) => r.json()),
    ]);
    setSequences(seqs);
    setTemplates(tpls);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    setBusy(true);
    setError(null);
    const tpl =
      templates.find((t) => t.occasion === occasion && t.channel === "email") ??
      templates[0];
    if (!tpl) {
      setError("Créez d’abord un modèle");
      setBusy(false);
      return;
    }
    const res = await fetch("/api/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        occasion,
        active: true,
        steps: [
          {
            id: crypto.randomUUID(),
            dayOffset: 0,
            templateId: tpl.id,
            channel: tpl.channel as Channel,
          },
        ],
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur");
      return;
    }
    await load();
  }

  async function toggle(seq: Sequence) {
    await fetch("/api/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...seq, active: !seq.active }),
    });
    await load();
  }

  async function addStep(seq: Sequence) {
    const tpl = templates.find((t) => t.occasion === seq.occasion) ?? templates[0];
    if (!tpl) return;
    const last = seq.steps[seq.steps.length - 1];
    await fetch("/api/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...seq,
        steps: [
          ...seq.steps,
          {
            id: crypto.randomUUID(),
            dayOffset: (last?.dayOffset ?? 0) + 1,
            templateId: tpl.id,
            channel: tpl.channel,
          },
        ],
      }),
    });
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Séquences</h1>
        <p className="mt-1 text-sm text-[#5a6b63]">
          Enchaînez plusieurs messages à l’avance (J-1, J0, J+1). Ideal pour
          anniversaires, Noël, bonne année.
        </p>
      </div>

      <div className="rounded-2xl border border-[#d5e0da] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Nouvelle séquence</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Occasion</Label>
            <select
              className="h-9 w-full rounded-lg border border-[#d5e0da] px-3 text-sm"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value as Occasion)}
            >
              <option value="birthday">Anniversaire</option>
              <option value="christmas">Noël</option>
              <option value="newyear">Bonne année</option>
              <option value="promotion">Nouveau poste</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => void create()}
              disabled={busy}
              className="w-full bg-[#0e1512] text-[#e8fff4]"
            >
              Créer
            </Button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="space-y-4">
        {sequences.map((seq) => (
          <div
            key={seq.id}
            className="rounded-2xl border border-[#d5e0da] bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold">{seq.name}</p>
                <p className="text-xs text-[#5a6b63]">
                  {seq.occasion} · {seq.steps.length} étape
                  {seq.steps.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span>Active</span>
                  <Switch
                    checked={seq.active}
                    onCheckedChange={() => void toggle(seq)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => void addStep(seq)}>
                  + Étape
                </Button>
              </div>
            </div>
            <ol className="mt-4 space-y-2">
              {seq.steps
                .slice()
                .sort((a, b) => a.dayOffset - b.dayOffset)
                .map((step) => {
                  const tpl = templates.find((t) => t.id === step.templateId);
                  return (
                    <li
                      key={step.id}
                      className="flex flex-wrap items-center gap-2 rounded-xl bg-[#f4f7f5] px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-[#2a9d6e]">
                        J{step.dayOffset >= 0 ? `+${step.dayOffset}` : step.dayOffset}
                      </span>
                      <span className="text-[#5a6b63]">·</span>
                      <span>{step.channel}</span>
                      <span className="text-[#5a6b63]">·</span>
                      <span>{tpl?.name ?? step.templateId}</span>
                    </li>
                  );
                })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
