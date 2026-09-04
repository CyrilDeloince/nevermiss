import { randomUUID } from "crypto";
import {
  addMessages,
  getStore,
  listMessages,
} from "./store";
import {
  buildSequenceMessages,
  fixedOccasionDate,
  nextBirthdayDate,
} from "./messages";
import { dispatchMessage } from "./send";
import type { ScheduledMessage } from "./types";

/** Programme les messages anniversaire / fêtes pour les 60 prochains jours */
export async function scheduleUpcoming(): Promise<{
  created: number;
  messages: ScheduledMessage[];
}> {
  const store = await getStore();
  if (!store.workspace) {
    return { created: 0, messages: [] };
  }

  const existing = await listMessages();
  const existingKeys = new Set(
    existing.map(
      (m) =>
        `${m.contactId}|${m.sequenceId ?? m.templateId}|${m.scheduledAt.slice(0, 10)}|${m.channel}`
    )
  );

  const created: ScheduledMessage[] = [];
  const activeSequences = store.sequences.filter((s) => s.active);

  for (const contact of store.contacts) {
    for (const sequence of activeSequences) {
      let eventDate: Date | null = null;
      if (sequence.occasion === "birthday" && contact.birthday) {
        eventDate = nextBirthdayDate(contact.birthday);
      } else if (
        sequence.occasion === "christmas" ||
        sequence.occasion === "newyear"
      ) {
        eventDate = fixedOccasionDate(sequence.occasion);
        if (eventDate && eventDate.getTime() < Date.now()) {
          eventDate = fixedOccasionDate(
            sequence.occasion,
            new Date().getFullYear() + 1
          );
        }
      }

      if (!eventDate) continue;
      // only schedule if event within 60 days
      const daysAhead =
        (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysAhead > 60) continue;

      const msgs = buildSequenceMessages({
        contact,
        sequence,
        templates: store.templates,
        workspace: store.workspace,
        eventDate,
      });

      for (const m of msgs) {
        const key = `${m.contactId}|${m.sequenceId}|${m.scheduledAt.slice(0, 10)}|${m.channel}`;
        if (existingKeys.has(key)) continue;
        existingKeys.add(key);
        created.push(m);
      }
    }
  }

  if (created.length) {
    await addMessages(created);
  }

  return { created: created.length, messages: created };
}

/** Envoie tous les messages dus (ordinateur éteint OK si cron cloud) */
export async function processDueMessages(): Promise<{
  processed: number;
  results: Awaited<ReturnType<typeof dispatchMessage>>[];
}> {
  const store = await getStore();
  if (!store.workspace) {
    return { processed: 0, results: [] };
  }

  const now = Date.now();
  const due = store.messages.filter(
    (m) => m.status === "scheduled" && new Date(m.scheduledAt).getTime() <= now
  );

  const results = [];
  for (const message of due) {
    const contact = store.contacts.find((c) => c.id === message.contactId);
    if (!contact) {
      results.push({
        id: message.id,
        status: "failed" as const,
        detail: "Contact introuvable",
      });
      continue;
    }
    results.push(await dispatchMessage(store.workspace, message, contact));
  }

  return { processed: results.length, results };
}

export async function scheduleOneOff(input: {
  contactId: string;
  templateId: string;
  scheduledAt: string;
}): Promise<ScheduledMessage> {
  const store = await getStore();
  if (!store.workspace) throw new Error("Aucun espace");
  const contact = store.contacts.find((c) => c.id === input.contactId);
  const template = store.templates.find((t) => t.id === input.templateId);
  if (!contact || !template) throw new Error("Contact ou modèle introuvable");

  const { renderTemplate, contactVars } = await import("./messages");
  const vars = contactVars(contact, store.workspace);
  const message: ScheduledMessage = {
    id: randomUUID(),
    contactId: contact.id,
    templateId: template.id,
    channel: template.channel,
    occasion: template.occasion,
    subject: template.subject
      ? renderTemplate(template.subject, vars)
      : undefined,
    body: renderTemplate(template.body, vars),
    scheduledAt: input.scheduledAt,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  };
  await addMessages([message]);
  return message;
}
