import { addDays, format, parseISO, setYear } from "date-fns";
import { fr } from "date-fns/locale";
import { randomUUID } from "crypto";
import type {
  Contact,
  Occasion,
  ScheduledMessage,
  Sequence,
  Template,
  Workspace,
} from "./types";

export function renderTemplate(
  text: string,
  vars: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

export function contactVars(
  contact: Contact,
  workspace: Workspace
): Record<string, string> {
  const first = contact.name.split(" ")[0] ?? contact.name;
  return {
    prenom: first,
    nom: contact.name,
    entreprise: contact.company ?? "",
    signature: workspace.ownerName,
    annee: String(new Date().getFullYear()),
  };
}

export function nextBirthdayDate(
  birthday: string,
  from = new Date()
): Date | null {
  try {
    const parsed = parseISO(birthday);
    if (Number.isNaN(parsed.getTime())) return null;
    let next = setYear(parsed, from.getFullYear());
    next = new Date(
      next.getFullYear(),
      next.getMonth(),
      next.getDate(),
      9,
      0,
      0,
      0
    );
    const startOfToday = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    );
    if (next < startOfToday) {
      next = setYear(next, from.getFullYear() + 1);
    }
    return next;
  } catch {
    return null;
  }
}

export function fixedOccasionDate(
  occasion: Occasion,
  year = new Date().getFullYear()
): Date | null {
  if (occasion === "christmas") return new Date(year, 11, 25, 9, 0, 0);
  if (occasion === "newyear") return new Date(year, 0, 1, 9, 0, 0);
  return null;
}

export function buildSequenceMessages(input: {
  contact: Contact;
  sequence: Sequence;
  templates: Template[];
  workspace: Workspace;
  eventDate: Date;
}): ScheduledMessage[] {
  const { contact, sequence, templates, workspace, eventDate } = input;
  const vars = contactVars(contact, workspace);
  const now = new Date().toISOString();
  const messages: ScheduledMessage[] = [];

  for (const step of sequence.steps) {
    const template = templates.find((t) => t.id === step.templateId);
    if (!template) continue;
    const scheduledAt = addDays(eventDate, step.dayOffset);
    if (scheduledAt.getTime() < Date.now() - 60_000) continue;

    messages.push({
      id: randomUUID(),
      contactId: contact.id,
      templateId: template.id,
      sequenceId: sequence.id,
      channel: step.channel,
      occasion: sequence.occasion,
      subject: template.subject
        ? renderTemplate(template.subject, vars)
        : undefined,
      body: renderTemplate(template.body, vars),
      scheduledAt: scheduledAt.toISOString(),
      status: "scheduled",
      createdAt: now,
    });
  }

  return messages;
}

export function formatFrDate(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy 'à' HH:mm", { locale: fr });
  } catch {
    return iso;
  }
}

export function whatsappDeepLink(phone: string, body: string): string {
  const digits = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
}
