"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Channel, Contact } from "@/lib/types";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  company: "",
  birthday: "",
  notes: "",
  preferredChannels: ["email"] as Channel[],
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
          Free : 5 contacts (famille). Pro : 500. Ajoutez date d’anniversaire
          pour déclencher les séquences.
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
              placeholder="Sophie Dupont"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="sophie@client.fr"
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone (WhatsApp)</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+33612345678"
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
          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <Input
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Canaux préférés</Label>
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
              Aucun contact. Ajoutez un membre de votre famille pour tester le
              plan Free.
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
                      {[c.email, c.phone, c.company].filter(Boolean).join(" · ") ||
                        "Pas de coordonnées"}
                    </p>
                    {c.birthday && (
                      <p className="mt-1 text-xs text-[#2a9d6e]">
                        Anniversaire : {c.birthday}
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
