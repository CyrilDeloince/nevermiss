import { randomUUID } from "crypto";
import { and, eq, lte } from "drizzle-orm";
import { addDays, parseISO, setYear } from "date-fns";
import { getDb, ensureSchema } from "./db/client";
import { contacts, messages, sequences, templates, users } from "./db/schema";
import { addActivity, parseChannels } from "./db/repo";
import { dispatchMessage } from "./send";
import { renderTemplate } from "./template-vars";
import type { SessionUser } from "./db/auth";
import type { Channel, SequenceStep } from "./types";

function applyTime(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h || 9, m || 0, 0, 0);
  return d;
}

function resolveSendTime(
  contact: { relationType: string; sendTime?: string | null },
  user: SessionUser
): string {
  if (contact.sendTime) return contact.sendTime;
  if (contact.relationType === "famille") return user.sendTimeFamille;
  if (contact.relationType === "travail") return user.sendTimeTravail;
  return user.sendTimeAmi;
}

function nextBirthday(
  birthday: string,
  hhmm: string,
  from = new Date()
): Date | null {
  try {
    const parsed = parseISO(birthday);
    let next = setYear(parsed, from.getFullYear());
    next = applyTime(next, hhmm);
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const day = new Date(next.getFullYear(), next.getMonth(), next.getDate());
    if (day < start) {
      next = setYear(parsed, from.getFullYear() + 1);
      next = applyTime(next, hhmm);
    }
    return next;
  } catch {
    return null;
  }
}

function mapUser(row: typeof users.$inferSelect): SessionUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    plan: row.plan as SessionUser["plan"],
    role: row.role as SessionUser["role"],
    ownerPhone: row.ownerPhone,
    ownerLinkedIn: row.ownerLinkedIn,
    sendTimeAmi: row.sendTimeAmi,
    sendTimeFamille: row.sendTimeFamille,
    sendTimeTravail: row.sendTimeTravail,
    emailMode: row.emailMode,
    smtpJson: row.smtpJson,
    whatsappMode: row.whatsappMode,
    whatsappToken: row.whatsappToken,
    whatsappPhoneId: row.whatsappPhoneId,
    linkedinEnabled: !!row.linkedinEnabled,
    createdAt: row.createdAt,
  };
}

export async function scheduleUpcomingForUser(userId: string) {
  await ensureSchema();
  const db = getDb();
  const [userRow] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!userRow) return { created: 0 };
  const user = mapUser(userRow);

  const contactRows = await db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, userId));
  const seqRows = await db
    .select()
    .from(sequences)
    .where(and(eq(sequences.userId, userId), eq(sequences.active, true)));
  const tplRows = await db
    .select()
    .from(templates)
    .where(eq(templates.userId, userId));
  const existing = await db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId));

  const keys = new Set(
    existing.map(
      (m) =>
        `${m.contactId}|${m.sequenceId}|${m.scheduledAt.slice(0, 10)}|${m.channel}`
    )
  );

  let created = 0;
  const now = new Date().toISOString();

  for (const contact of contactRows) {
    const preferred = parseChannels(contact.preferredChannels);
    const hhmm = resolveSendTime(contact, user);

    for (const seq of seqRows) {
      if (seq.occasion !== "birthday" || !contact.birthday) continue;
      const eventDate = nextBirthday(contact.birthday, hhmm);
      if (!eventDate) continue;
      const daysAhead =
        (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysAhead > 60) continue;

      const steps = JSON.parse(seq.stepsJson || "[]") as SequenceStep[];
      const vars = {
        prenom: contact.name.split(" ")[0] ?? contact.name,
        nom: contact.name,
        entreprise: contact.company ?? "",
        signature: user.name,
        annee: String(new Date().getFullYear()),
      };

      for (const step of steps) {
        if (!preferred.includes(step.channel as Channel)) continue;
        const tpl = tplRows.find((t) => t.id === step.templateId);
        if (!tpl) continue;

        let when = addDays(eventDate, step.dayOffset);
        when = applyTime(when, hhmm);
        if (when.getTime() < Date.now() - 60_000) {
          if (step.dayOffset === 0) when = new Date(Date.now() + 5_000);
          else continue;
        }

        let body = renderTemplate(tpl.body, vars);
        if (
          seq.occasion === "birthday" &&
          step.dayOffset === 0 &&
          step.channel === "whatsapp" &&
          contact.notes?.trim()
        ) {
          body = contact.notes.trim();
        }

        const key = `${contact.id}|${seq.id}|${when.toISOString().slice(0, 10)}|${step.channel}`;
        if (keys.has(key)) continue;
        keys.add(key);

        await db.insert(messages).values({
          id: randomUUID(),
          userId,
          contactId: contact.id,
          templateId: tpl.id,
          sequenceId: seq.id,
          channel: step.channel,
          occasion: seq.occasion,
          subject: tpl.subject ? renderTemplate(tpl.subject, vars) : null,
          body,
          scheduledAt: when.toISOString(),
          status: "scheduled",
          createdAt: now,
        });
        created += 1;
      }
    }
  }

  if (created) {
    await addActivity(
      userId,
      "scheduled",
      `${created} message(s) programmé(s) automatiquement`
    );
  }
  return { created };
}

export async function processDueForUser(userId: string) {
  await ensureSchema();
  const db = getDb();
  const [userRow] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!userRow) {
    return {
      processed: 0,
      results: [] as Awaited<ReturnType<typeof dispatchMessage>>[],
    };
  }
  const user = mapUser(userRow);
  const now = new Date().toISOString();
  const due = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.status, "scheduled"),
        lte(messages.scheduledAt, now)
      )
    );

  const results = [];
  for (const msg of due) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, msg.contactId))
      .limit(1);
    if (!contact) {
      results.push({
        id: msg.id,
        status: "failed" as const,
        detail: "Contact introuvable",
      });
      continue;
    }
    results.push(await dispatchMessage(user, msg, contact));
  }
  return { processed: results.length, results };
}

export async function processDueAllUsers() {
  await ensureSchema();
  const db = getDb();
  const all = await db.select().from(users);
  let processed = 0;
  let scheduled = 0;
  for (const u of all) {
    const s = await scheduleUpcomingForUser(u.id);
    scheduled += s.created;
    const p = await processDueForUser(u.id);
    processed += p.processed;
  }
  return { scheduled, processed };
}

export async function sendNowForUser(
  user: SessionUser,
  input: {
    contactId: string;
    channel: Channel;
    body?: string;
    subject?: string;
  }
) {
  const db = getDb();
  const [contact] = await db
    .select()
    .from(contacts)
    .where(
      and(eq(contacts.id, input.contactId), eq(contacts.userId, user.id))
    )
    .limit(1);
  if (!contact) throw new Error("Contact introuvable");

  const [tpl] = await db
    .select()
    .from(templates)
    .where(
      and(eq(templates.userId, user.id), eq(templates.channel, input.channel))
    )
    .limit(1);

  const vars = {
    prenom: contact.name.split(" ")[0] ?? contact.name,
    nom: contact.name,
    entreprise: contact.company ?? "",
    signature: user.name,
    annee: String(new Date().getFullYear()),
  };

  const body =
    input.body?.trim() ||
    (input.channel === "whatsapp" && contact.notes?.trim()) ||
    (tpl
      ? renderTemplate(tpl.body, vars)
      : `Joyeux anniversaire ${vars.prenom} !`);

  const id = randomUUID();
  const now = new Date().toISOString();
  await db.insert(messages).values({
    id,
    userId: user.id,
    contactId: contact.id,
    templateId: tpl?.id,
    channel: input.channel,
    occasion: "birthday",
    subject:
      input.subject ||
      (tpl?.subject ? renderTemplate(tpl.subject, vars) : null),
    body: typeof body === "string" ? body : String(body),
    scheduledAt: now,
    status: "scheduled",
    createdAt: now,
  });

  const [msg] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);
  const result = await dispatchMessage(user, msg!, contact);
  const [updated] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);
  return { message: updated, result };
}

export async function scheduleOneOff(
  user: SessionUser,
  input: {
    contactId: string;
    templateId: string;
    scheduledAt: string;
    bodyOverride?: string;
  }
) {
  const db = getDb();
  const [contact] = await db
    .select()
    .from(contacts)
    .where(
      and(eq(contacts.id, input.contactId), eq(contacts.userId, user.id))
    )
    .limit(1);
  if (!contact) throw new Error("Contact introuvable");
  const [tpl] = await db
    .select()
    .from(templates)
    .where(
      and(eq(templates.id, input.templateId), eq(templates.userId, user.id))
    )
    .limit(1);
  if (!tpl) throw new Error("Modèle introuvable");

  const vars = {
    prenom: contact.name.split(" ")[0] ?? contact.name,
    nom: contact.name,
    entreprise: contact.company ?? "",
    signature: user.name,
    annee: String(new Date().getFullYear()),
  };

  const id = randomUUID();
  const now = new Date().toISOString();
  await db.insert(messages).values({
    id,
    userId: user.id,
    contactId: contact.id,
    templateId: tpl.id,
    channel: tpl.channel,
    occasion: tpl.occasion,
    subject: tpl.subject ? renderTemplate(tpl.subject, vars) : null,
    body: input.bodyOverride?.trim() || renderTemplate(tpl.body, vars),
    scheduledAt: input.scheduledAt,
    status: "scheduled",
    createdAt: now,
  });
  await addActivity(
    user.id,
    "scheduled",
    `Message programmé pour ${contact.name}`
  );
  const [msg] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);
  return msg;
}
