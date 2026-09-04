"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Channel, Occasion, Template } from "@/lib/types";

const occasions: { id: Occasion; label: string }[] = [
  { id: "birthday", label: "Anniversaire" },
  { id: "christmas", label: "Noël" },
  { id: "newyear", label: "Bonne année" },
  { id: "promotion", label: "Nouveau poste" },
  { id: "custom", label: "Custom" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState({
    name: "",
    occasion: "birthday" as Occasion,
    channel: "email" as Channel,
    subject: "",
    body: "Bonjour {{prenom}},\n\n…\n\n{{signature}}",
  });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setTemplates(await fetch("/api/templates").then((r) => r.json()));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setBusy(true);
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    setForm({
      name: "",
      occasion: "birthday",
      channel: "email",
      subject: "",
      body: "Bonjour {{prenom}},\n\n…\n\n{{signature}}",
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Modèles</h1>
        <p className="mt-1 text-sm text-[#5a6b63]">
          Variables : {"{{prenom}}"}, {"{{nom}}"}, {"{{entreprise}}"},{" "}
          {"{{signature}}"}, {"{{annee}}"}. Préparez Noël et bonne année à
          l’avance.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-3 rounded-2xl border border-[#d5e0da] bg-white p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <h2 className="font-display text-lg font-semibold">Nouveau modèle</h2>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Occasion</Label>
              <select
                className="h-9 w-full rounded-lg border border-[#d5e0da] bg-white px-3 text-sm"
                value={form.occasion}
                onChange={(e) =>
                  setForm({ ...form, occasion: e.target.value as Occasion })
                }
              >
                {occasions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Canal</Label>
              <select
                className="h-9 w-full rounded-lg border border-[#d5e0da] bg-white px-3 text-sm"
                value={form.channel}
                onChange={(e) =>
                  setForm({ ...form, channel: e.target.value as Channel })
                }
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
          </div>
          {form.channel === "email" && (
            <div className="space-y-2">
              <Label>Objet</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              required
              rows={8}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-[#0e1512] text-[#e8fff4]"
          >
            Enregistrer
          </Button>
        </form>

        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-[#d5e0da] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-[#5a6b63]">
                    {t.occasion} · {t.channel}
                  </p>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-[#5a6b63]">
                    {t.subject ? `${t.subject}\n` : ""}
                    {t.body}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => void remove(t.id)}>
                  Suppr.
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
