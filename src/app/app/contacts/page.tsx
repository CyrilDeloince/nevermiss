"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Channel, Contact, RelationType } from "@/lib/types";
import { RELATION_LABELS } from "@/lib/types";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  company: "",
  birthday: "",
  notes: "",
  relationType: "ami" as RelationType,
  sendTime: "",
  preferredChannels: ["whatsapp"] as Channel[],
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/contacts");
    setContacts(await res.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Erreur");
      return;
    }
    setForm(emptyForm);
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
    await load();
  }

  function toggleChannel(channel: Channel) {
    setForm((f) => {
      const has = f.preferredChannels.includes(channel);
      return {
        ...f,
        preferredChannels: has
          ? f.preferredChannels.filter((c) => c !== channel)
          : [...f.preferredChannels, channel],
      };
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Contacts</h1>
        <p className="mt-1 text-sm text-[#5a6b63]">
          Type de relation + heure d’envoi. Le téléphone = WhatsApp du{" "}
          <strong>destinataire</strong> (pas le vôtre).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form
          className="space-y-3 rounded-2xl border border-[#d5e0da] bg-white p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <h2 className="font-display text-lg font-semibold">Nouveau contact</h2>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Guillaume Courcelaud"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp du contact</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="06 XX XX XX XX"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Anniversaire</Label>
              <Input
                type="date"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Entreprise</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type de relation</Label>
              <select
                className="h-9 w-full rounded-lg border border-[#d5e0da] px-3 text-sm"
                value={form.relationType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    relationType: e.target.value as RelationType,
                  })
                }
              >
                <option value="ami">Ami</option>
                <option value="famille">Famille</option>
                <option value="travail">Travail</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Heure d’envoi (optionnel)</Label>
              <Input
                type="time"
                value={form.sendTime}
                onChange={(e) => setForm({ ...form, sendTime: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <Input
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Message perso (ex. Bon anniv bb)</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Canaux</Label>
            <div className="flex flex-wrap gap-2">
              {(["email", "whatsapp", "linkedin"] as Channel[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChannel(c)}
                  className={`rounded-lg px-3 py-1.5 text-xs capitalize ${
                    form.preferredChannels.includes(c)
                      ? "bg-[#0e1512] text-[#e8fff4]"
                      : "bg-[#e8efeb] text-[#5a6b63]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-[#0e1512] text-[#e8fff4]"
          >
            {busy ? "Enregistrement…" : "Ajouter"}
          </Button>
        </form>

        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d5e0da] bg-white p-8 text-sm text-[#5a6b63]">
              Aucun contact.
            </div>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-[#d5e0da] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-[#5a6b63]">
                      {RELATION_LABELS[c.relationType ?? "ami"]}
                      {c.sendTime ? ` · ${c.sendTime}` : ""}
                      {" · "}
                      {[c.email, c.phone, c.company].filter(Boolean).join(" · ") ||
                        "Pas de coordonnées"}
                    </p>
                    {c.birthday && (
                      <p className="mt-1 text-xs text-[#2a9d6e]">
                        Anniversaire : {c.birthday}
                      </p>
                    )}
                    {c.notes && (
                      <p className="mt-1 text-xs italic text-[#5a6b63]">
                        « {c.notes} »
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void remove(c.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
