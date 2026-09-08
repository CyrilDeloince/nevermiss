"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateEditor } from "@/components/template-editor";
import { labelForVar, parseTemplateBody, previewTemplate } from "@/lib/template-vars";
import type { Channel, Occasion, Template } from "@/lib/types";

const occasions: { id: Occasion; label: string }[] = [
  { id: "birthday", label: "Anniversaire" },
  { id: "christmas", label: "Noël" },
  { id: "newyear", label: "Bonne année" },
  { id: "promotion", label: "Nouveau poste" },
  { id: "custom", label: "Perso" },
];

function BodyPreview({ body }: { body: string }) {
  const parts = parseTemplateBody(body);
  return (
    <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
      {parts.map((p, i) =>
        p.type === "var" ? (
          <span
            key={i}
            className="mx-0.5 inline-flex rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--foreground)]"
          >
            {labelForVar(p.value)}
          </span>
        ) : (
          <span key={i}>{p.value}</span>
        )
      )}
    </p>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState({
    name: "",
    occasion: "birthday" as Occasion,
    channel: "email" as Channel,
    subject: "",
    body: "Bonjour ,\n\nJe voulais te souhaiter un excellent anniversaire.\n\n",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/templates");
    const data = await res.json();
    if (Array.isArray(data)) setTemplates(data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    setForm({
      name: "",
      occasion: "birthday",
      channel: "email",
      subject: "",
      body: "Bonjour ,\n\nJe voulais te souhaiter un excellent anniversaire.\n\n",
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
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Cliquez Prénom, Nom, Signature… — pas besoin de taper des caractères
          bizarres. Les messages sont prêts à l’emploi.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5"
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
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
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
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
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
                placeholder="Joyeux anniversaire…"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Message</Label>
            <TemplateEditor
              value={form.body}
              onChange={(body) => setForm({ ...form, body })}
              rows={8}
            />
          </div>
          <div className="rounded-xl bg-[var(--secondary)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            Aperçu : {previewTemplate(form.body).slice(0, 120)}…
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-[var(--ink)] text-white"
          >
            Enregistrer
          </Button>
        </form>

        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-[var(--border)] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t.occasion} · {t.channel}
                  </p>
                  <BodyPreview body={t.body} />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void remove(t.id)}
                >
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
