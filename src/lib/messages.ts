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
import { DEFAULT_SEND_TIMES } from "./types";

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

export function resolveSendTime(
  contact: Contact,
  workspace: Workspace
): { hour: number; minute: number } {
  const raw =
    contact.sendTime ||
    workspace.sendTimeDefaults?.[contact.relationType] ||
    DEFAULT_SEND_TIMES[contact.relationType] ||
    "09:00";
  const [h, m] = raw.split(":").map((n) => Number(n));
  return {
    hour: Number.isFinite(h) ? h : 9,
    minute: Number.isFinite(m) ? m : 0,
  };
}

export function applySendTime(
  date: Date,
  contact: Contact,
  workspace: Workspace
): Date {
  const { hour, minute } = resolveSendTime(contact, workspace);
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
}

export function nextBirthdayDate(
  birthday: string,
  contact: Contact,
  workspace: Workspace,
  from = new Date()
): Date | null {
  try {
    const parsed = parseISO(birthday);
    if (Number.isNaN(parsed.getTime())) return null;
    let next = setYear(parsed, from.getFullYear());
    next = applySendTime(next, contact, workspace);
    const startOfToday = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    );
    // Si l’heure d’aujourd’hui est déjà passée, on garde aujourd’hui
    // (le message sera "due" immédiatement). Sinon demain année+1 si date passée.
    if (
      next < startOfToday ||
      (next.getFullYear() === from.getFullYear() &&
        next.getMonth() === from.getMonth() &&
        next.getDate() === from.getDate() &&
        false)
    ) {
      // date calendaire déjà passée (jour précédent)
    }
    const dayOnly = new Date(
      next.getFullYear(),
      next.getMonth(),
      next.getDate()
    );
    if (dayOnly < startOfToday) {
      next = setYear(parsed, from.getFullYear() + 1);
      next = applySendTime(next, contact, workspace);
    }
    return next;
  } catch {
    return null;
  }
}

export function fixedOccasionDate(
  occasion: Occasion,
  contact: Contact,
  workspace: Workspace,
  year = new Date().getFullYear()
): Date | null {
  let base: Date | null = null;
  if (occasion === "christmas") base = new Date(year, 11, 25);
  if (occasion === "newyear") base = new Date(year, 0, 1);
  if (!base) return null;
  return applySendTime(base, contact, workspace);
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
  const preferred = contact.preferredChannels?.length
    ? contact.preferredChannels
    : (["email", "whatsapp", "linkedin"] as const);

  for (const step of sequence.steps) {
    if (!preferred.includes(step.channel)) continue;
    const template = templates.find((t) => t.id === step.templateId);
    if (!template) continue;

    let scheduledAt = addDays(eventDate, step.dayOffset);
    scheduledAt = applySendTime(scheduledAt, contact, workspace);

    // J0 aujourd’hui déjà passé → envoyer maintenant (+30s)
    if (scheduledAt.getTime() < Date.now() - 60_000) {
      if (step.dayOffset === 0) {
        scheduledAt = new Date(Date.now() + 5_000);
      } else {
        continue;
      }
    }

    let body = renderTemplate(template.body, vars);
    // Message perso (notes) uniquement sur WhatsApp J0
    if (
      sequence.occasion === "birthday" &&
      step.dayOffset === 0 &&
      step.channel === "whatsapp" &&
      contact.notes?.trim()
    ) {
      body = contact.notes.trim();
    }

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
      body,
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

export function normalizePhone(phone: string): string {
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    digits = `+33${digits.slice(1)}`;
  }
  return digits;
}

export function whatsappDeepLink(phone: string, body: string): string {
  const digits = normalizePhone(phone).replace(/^\+/, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
}

export function gmailComposeLink(
  to: string,
  subject: string,
  body: string
): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function mailtoLink(to: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
