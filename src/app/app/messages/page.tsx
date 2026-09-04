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
    setMessages(msgs);
    setContacts(cts);
    setTemplates(tpls);
    setContactId((prev) => prev || cts[0]?.id || "");
    setTemplateId((prev) => prev || tpls[0]?.id || "");
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
    setFlash(`${res.created} message(s) programmé(s) sur 60 jours`);
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
    setFlash(`${res.processed} message(s) traité(s)`);
    await load();
    setBusy(false);
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
    setFlash("Message ponctuel ajouté à la file");
    await load();
    setBusy(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">File d’envoi</h1>
          <p className="mt-1 text-sm text-[#5a6b63]">
            Programmez à l’avance, envoyez maintenant ou laissez le cron cloud
            tourner.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => void scheduleUpcoming()}
            disabled={busy}
            className="bg-[#0e1512] text-[#e8fff4]"
          >
            Programmer (60 j)
          </Button>
          <Button
            onClick={() => void processDue()}
            disabled={busy}
            className="bg-[#7cffb2] text-[#0e1512] hover:bg-[#9affc6]"
          >
            Traiter les dus
          </Button>
        </div>
      </div>

      {flash && (
        <div className="rounded-xl border border-[#7cffb2]/40 bg-[#7cffb2]/15 px-4 py-3 text-sm">
          {flash}
        </div>
      )}

      <div className="rounded-2xl border border-[#d5e0da] bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Envoi ponctuel</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Contact</Label>
            <select
              className="h-9 w-full rounded-lg border border-[#d5e0da] px-3 text-sm"
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
              className="h-9 w-full rounded-lg border border-[#d5e0da] px-3 text-sm"
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
            <Label>Date / heure</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => void oneOff()}
              disabled={busy || !contacts.length}
              className="w-full bg-[#0e1512] text-[#e8fff4]"
            >
              Programmer
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d5e0da] bg-white p-8 text-sm text-[#5a6b63]">
            File vide. Ajoutez un contact avec anniversaire puis cliquez
            « Programmer (60 j) ».
          </div>
        ) : (
          messages.map((m) => {
            const contact = contacts.find((c) => c.id === m.contactId);
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-[#d5e0da] bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {contact?.name ?? "?"} · {m.channel} · {m.occasion}
                    </p>
                    <p className="mt-1 text-sm text-[#5a6b63] whitespace-pre-wrap line-clamp-4">
                      {m.subject ? `${m.subject}\n` : ""}
                      {m.body}
                    </p>
                    {m.error && (
                      <p className="mt-1 text-xs text-red-600">{m.error}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-[#5a6b63]">
                    <p
                      className={
                        m.status === "sent"
                          ? "text-[#2a9d6e]"
                          : m.status === "failed"
                            ? "text-red-600"
                            : ""
                      }
                    >
                      {m.status}
                    </p>
                    <p className="mt-1">{formatFrDate(m.scheduledAt)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
