"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contact, ScheduledMessage, Template } from "@/lib/types";
import { formatFrDate } from "@/lib/messages-client";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [contactId, setContactId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [msgs, cts, tpls] = await Promise.all([
      fetch("/api/messages").then((r) => r.json()),
      fetch("/api/contacts").then((r) => r.json()),
      fetch("/api/templates").then((r) => r.json()),
    ]);
    if (Array.isArray(msgs)) setMessages(msgs);
    if (Array.isArray(cts)) {
      setContacts(cts);
      setContactId((prev) => prev || cts[0]?.id || "");
    }
    if (Array.isArray(tpls)) {
      setTemplates(tpls);
      setTemplateId((prev) => prev || tpls[0]?.id || "");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function scheduleUpcoming() {
    setBusy(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "schedule-upcoming" }),
    }).then((r) => r.json());
    setFlash(`${res.created ?? 0} message(s) programmé(s)`);
    await load();
    setBusy(false);
  }

  async function processDue() {
    setBusy(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "process-due" }),
    }).then((r) => r.json());
    const fails = (res.results || []).filter(
      (r: { status: string }) => r.status === "failed"
    ).length;
    setFlash(
      `${res.processed ?? 0} traité(s)${fails ? ` · ${fails} échec(s)` : ""} — envoi background, aucune fenêtre ouverte.`
    );
    await load();
    setBusy(false);
  }

  async function sendNow(
    contactIdToSend: string,
    channel: "email" | "whatsapp" | "linkedin"
  ) {
    setBusy(true);
    setFlash(null);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send-now",
        contactId: contactIdToSend,
        channel,
      }),
    }).then((r) => r.json());
    setBusy(false);
    if (res.error) {
      setFlash(res.error);
      return;
    }
    await load();
    setFlash(res.result?.detail ?? "Traité en arrière-plan");
  }

  async function oneOff() {
    if (!contactId || !templateId || !scheduledAt) return;
    setBusy(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "one-off",
        contactId,
        templateId,
        scheduledAt: new Date(scheduledAt).toISOString(),
      }),
    });
    setFlash("Message ajouté à la file — il partira à l’heure choisie.");
    await load();
    setBusy(false);
  }

  const contactName = (id: string) =>
    contacts.find((c) => c.id === id)?.name ?? id.slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">File d’envoi</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Planifiez ici. Le cron cloud envoie sans ouvrir WhatsApp ni voler le
          focus — même PC / téléphone ailleurs.
        </p>
      </div>

      {flash && (
        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
          {flash}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => void scheduleUpcoming()}
          disabled={busy}
          className="bg-[var(--ink)] text-white"
        >
          Programmer les anniversaires
        </Button>
        <Button
          onClick={() => void processDue()}
          disabled={busy}
          variant="outline"
        >
          Traiter les dus (background)
        </Button>
      </div>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Programmer un envoi</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Contact</Label>
            <select
              className="h-9 w-full rounded-lg border border-[var(--border)] px-3 text-sm"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Modèle</Label>
            <select
              className="h-9 w-full rounded-lg border border-[var(--border)] px-3 text-sm"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Date & heure</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => void oneOff()} disabled={busy} variant="outline">
          Ajouter à la file
        </Button>
      </section>

      {contacts[0] && (
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="mb-3 font-display text-lg font-semibold">
            Envoyer maintenant (test)
          </h2>
          <div className="flex flex-wrap gap-2">
            {(["email", "whatsapp", "linkedin"] as const).map((ch) => (
              <Button
                key={ch}
                variant="outline"
                disabled={busy}
                onClick={() => void sendNow(contacts[0].id, ch)}
              >
                {ch} → {contacts[0].name}
              </Button>
            ))}
          </div>
        </section>
      )}

      <ul className="space-y-3">
        {messages.length === 0 && (
          <li className="text-sm text-[var(--muted-foreground)]">
            Aucun message dans la file.
          </li>
        )}
        {messages.map((m) => (
          <li
            key={m.id}
            className="rounded-2xl border border-[var(--border)] bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">
                  {contactName(m.contactId)} · {m.channel} ·{" "}
                  <span className="uppercase tracking-wide">{m.status}</span>
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {formatFrDate(m.scheduledAt)}
                  {m.sentAt ? ` · envoyé ${formatFrDate(m.sentAt)}` : ""}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted-foreground)] line-clamp-3">
                  {m.body}
                </p>
                {m.error && (
                  <p className="mt-2 text-xs text-red-600">{m.error}</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
