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
    setFlash(`${res.created} message(s) programmé(s)`);
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
    setFlash(
      `${res.processed} message(s) prêt(s) — cliquez les boutons verts pour ouvrir WhatsApp / Gmail / LinkedIn`
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
      body: JSON.stringify({ action: "send-now", contactId: contactIdToSend, channel }),
    }).then((r) => r.json());
    setBusy(false);
    if (res.error) {
      setFlash(res.error);
      return;
    }
    await load();
    const link = res.message?.deepLink || res.result?.deepLink;
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
      setFlash(
        `Ouverture ${channel} pour envoyer. Sur WhatsApp : appuyez sur Envoyer.`
      );
    } else {
      setFlash(res.result?.detail ?? "Message préparé");
    }
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

  const ready = messages.filter((m) => m.status === "ready");
  const scheduled = messages.filter((m) => m.status === "scheduled");
  const others = messages.filter(
    (m) => m.status !== "ready" && m.status !== "scheduled"
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">File d’envoi</h1>
          <p className="mt-1 text-sm text-[#5a6b63]">
            Sans API payante : NeverMiss prépare le message, vous validez en 1
            clic sur WhatsApp / Gmail / LinkedIn.
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
            Préparer les dus
          </Button>
        </div>
      </div>

      {flash && (
        <div className="rounded-xl border border-[#7cffb2]/40 bg-[#7cffb2]/15 px-4 py-3 text-sm">
          {flash}
        </div>
      )}

      <section className="rounded-2xl border border-[#2a9d6e] bg-[#7cffb2]/10 p-5">
        <h2 className="font-display text-lg font-semibold">
          Envoyer maintenant à un contact
        </h2>
        <p className="mt-1 text-sm text-[#5a6b63]">
          Anniversaire aujourd’hui ? Choisissez le canal — le message perso
          (notes) est utilisé s’il existe.
        </p>
        <div className="mt-4 space-y-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-[#5a6b63]">
                  {c.birthday ? `Anniv. ${c.birthday}` : "Pas d’anniversaire"}
                  {c.notes ? ` · « ${c.notes} »` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={busy || !c.phone}
                  className="bg-[#25D366] text-white hover:bg-[#1ebe57]"
                  onClick={() => void sendNow(c.id, "whatsapp")}
                >
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  disabled={busy || !c.email}
                  className="bg-[#EA4335] text-white hover:bg-[#d33426]"
                  onClick={() => void sendNow(c.id, "email")}
                >
                  Gmail
                </Button>
                <Button
                  size="sm"
                  disabled={busy || !c.linkedinUrl}
                  className="bg-[#0A66C2] text-white hover:bg-[#0958a8]"
                  onClick={() => void sendNow(c.id, "linkedin")}
                >
                  LinkedIn
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {ready.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">
            Prêts — cliquez pour ouvrir
          </h2>
          {ready.map((m) => {
            const contact = contacts.find((c) => c.id === m.contactId);
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-[#2a9d6e] bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {contact?.name ?? "?"} · {m.channel}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[#5a6b63]">
                      {m.body}
                    </p>
                    <p className="mt-1 text-xs text-[#5a6b63]">
                      Prévu : {formatFrDate(m.scheduledAt)}
                    </p>
                  </div>
                  {m.deepLink && (
                    <a
                      href={m.deepLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-[#7cffb2] px-4 py-2 text-sm font-medium text-[#0e1512]"
                    >
                      Ouvrir {m.channel}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </section>
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
            <Label>Date / heure précise</Label>
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
        <h2 className="font-display text-lg font-semibold">Programmés</h2>
        {scheduled.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d5e0da] bg-white p-6 text-sm text-[#5a6b63]">
            Aucun message programmé. Cliquez « Programmer (60 j) » ou utilisez
            Envoyer maintenant.
          </div>
        ) : (
          scheduled.map((m) => {
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
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-[#5a6b63]">
                      {m.body}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[#5a6b63]">
                    <p>scheduled</p>
                    <p className="mt-1 font-medium text-[#0e1512]">
                      {formatFrDate(m.scheduledAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {others.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Historique</h2>
          {others.map((m) => {
            const contact = contacts.find((c) => c.id === m.contactId);
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-[#d5e0da] bg-white p-4 text-sm"
              >
                <p className="font-medium">
                  {contact?.name} · {m.channel} · {m.status}
                </p>
                <p className="text-xs text-[#5a6b63]">
                  {formatFrDate(m.scheduledAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
