import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { getDb, ensureSchema } from "./client";
import {
  activity,
  contacts,
  messages,
  sequences,
  templates,
  users,
} from "./schema";
import type { SessionUser } from "./auth";
import type {
  Channel,
  Occasion,
  PlanId,
  RelationType,
  SequenceStep,
} from "../types";
import { PLAN_LIMITS } from "../types";

export async function addActivity(
  userId: string,
  type: string,
  message: string
) {
  const db = getDb();
  await db.insert(activity).values({
    id: randomUUID(),
    userId,
    type,
    message,
    createdAt: new Date().toISOString(),
  });
}

export function parseChannels(raw: string): Channel[] {
  try {
    return JSON.parse(raw) as Channel[];
  } catch {
    return ["email"];
  }
}

export async function listContacts(userId: string) {
  await ensureSchema();
  const db = getDb();
  const rows = await db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, userId))
    .orderBy(desc(contacts.createdAt));
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email ?? undefined,
    phone: c.phone ?? undefined,
    linkedinUrl: c.linkedinUrl ?? undefined,
    company: c.company ?? undefined,
    birthday: c.birthday ?? undefined,
    notes: c.notes ?? undefined,
    relationType: (c.relationType as RelationType) || "ami",
    sendTime: c.sendTime ?? undefined,
    preferredChannels: parseChannels(c.preferredChannels),
    createdAt: c.createdAt,
  }));
}

export async function upsertContact(
  userId: string,
  plan: PlanId,
  input: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    company?: string;
    birthday?: string;
    notes?: string;
    relationType: RelationType;
    sendTime?: string;
    preferredChannels: Channel[];
  }
) {
  const db = getDb();
  if (input.id) {
    await db
      .update(contacts)
      .set({
        name: input.name,
        email: input.email,
        phone: input.phone,
        linkedinUrl: input.linkedinUrl,
        company: input.company,
        birthday: input.birthday,
        notes: input.notes,
        relationType: input.relationType,
        sendTime: input.sendTime,
        preferredChannels: JSON.stringify(input.preferredChannels),
      })
      .where(and(eq(contacts.id, input.id), eq(contacts.userId, userId)));
    return input.id;
  }
  const existing = await listContacts(userId);
  if (existing.length >= PLAN_LIMITS[plan].contacts) {
    throw new Error(
      `Limite ${plan} atteinte (${PLAN_LIMITS[plan].contacts} contacts). Passez en Pro.`
    );
  }
  const id = randomUUID();
  await db.insert(contacts).values({
    id,
    userId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    linkedinUrl: input.linkedinUrl,
    company: input.company,
    birthday: input.birthday,
    notes: input.notes,
    relationType: input.relationType,
    sendTime: input.sendTime,
    preferredChannels: JSON.stringify(input.preferredChannels),
    createdAt: new Date().toISOString(),
  });
  await addActivity(userId, "contact", `Contact ajouté : ${input.name}`);
  return id;
}

export async function deleteContact(userId: string, id: string) {
  const db = getDb();
  await db
    .delete(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
}

export async function listTemplates(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(templates)
    .where(eq(templates.userId, userId))
    .orderBy(desc(templates.createdAt));
}

export async function upsertTemplate(
  userId: string,
  input: {
    id?: string;
    name: string;
    occasion: Occasion;
    channel: Channel;
    subject?: string;
    body: string;
  }
) {
  const db = getDb();
  if (input.id) {
    await db
      .update(templates)
      .set(input)
      .where(and(eq(templates.id, input.id), eq(templates.userId, userId)));
    return input.id;
  }
  const id = randomUUID();
  await db.insert(templates).values({
    id,
    userId,
    ...input,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function deleteTemplate(userId: string, id: string) {
  const db = getDb();
  await db
    .delete(templates)
    .where(and(eq(templates.id, id), eq(templates.userId, userId)));
}

export async function listSequences(userId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(sequences)
    .where(eq(sequences.userId, userId))
    .orderBy(desc(sequences.createdAt));
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    occasion: s.occasion as Occasion,
    active: !!s.active,
    steps: JSON.parse(s.stepsJson || "[]") as SequenceStep[],
    createdAt: s.createdAt,
  }));
}

export async function upsertSequence(
  userId: string,
  plan: PlanId,
  input: {
    id?: string;
    name: string;
    occasion: Occasion;
    active: boolean;
    steps: SequenceStep[];
  }
) {
  const db = getDb();
  if (!input.id) {
    const existing = await listSequences(userId);
    if (existing.length >= PLAN_LIMITS[plan].sequences) {
      throw new Error(
        `Limite de séquences atteinte (${PLAN_LIMITS[plan].sequences}).`
      );
    }
  }
  if (input.id) {
    await db
      .update(sequences)
      .set({
        name: input.name,
        occasion: input.occasion,
        active: input.active,
        stepsJson: JSON.stringify(input.steps),
      })
      .where(and(eq(sequences.id, input.id), eq(sequences.userId, userId)));
    return input.id;
  }
  const id = randomUUID();
  await db.insert(sequences).values({
    id,
    userId,
    name: input.name,
    occasion: input.occasion,
    active: input.active,
    stepsJson: JSON.stringify(input.steps),
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function listMessages(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId))
    .orderBy(desc(messages.scheduledAt));
}

export async function listActivity(userId: string, limit = 20) {
  const db = getDb();
  return db
    .select()
    .from(activity)
    .where(eq(activity.userId, userId))
    .orderBy(desc(activity.createdAt))
    .limit(limit);
}

export async function updateUserProfile(
  userId: string,
  patch: Partial<{
    name: string;
    plan: PlanId;
    ownerPhone: string;
    ownerLinkedIn: string;
    sendTimeAmi: string;
    sendTimeFamille: string;
    sendTimeTravail: string;
    emailMode: string;
    smtpJson: string;
    whatsappMode: string;
    whatsappToken: string;
    whatsappPhoneId: string;
    linkedinEnabled: boolean;
  }>
) {
  const db = getDb();
  await db.update(users).set(patch).where(eq(users.id, userId));
  await addActivity(userId, "info", "Profil / canaux mis à jour");
}

export async function adminStats() {
  await ensureSchema();
  const db = getDb();
  const allUsers = await db.select().from(users);
  const allContacts = await db.select().from(contacts);
  const allMessages = await db.select().from(messages);
  return {
    users: allUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      plan: u.plan,
      role: u.role,
      createdAt: u.createdAt,
      contactCount: allContacts.filter((c) => c.userId === u.id).length,
      messageCount: allMessages.filter((m) => m.userId === u.id).length,
      sentCount: allMessages.filter(
        (m) => m.userId === u.id && m.status === "sent"
      ).length,
    })),
    totals: {
      users: allUsers.length,
      contacts: allContacts.length,
      messages: allMessages.length,
      sent: allMessages.filter((m) => m.status === "sent").length,
    },
  };
}

export function userToWorkspace(user: SessionUser) {
  return {
    id: user.id,
    ownerEmail: user.email,
    ownerName: user.name,
    ownerPhone: user.ownerPhone ?? undefined,
    ownerLinkedIn: user.ownerLinkedIn ?? undefined,
    plan: user.plan,
    sendTimeDefaults: {
      ami: user.sendTimeAmi,
      famille: user.sendTimeFamille,
      travail: user.sendTimeTravail,
    },
    channels: {
      email: {
        enabled: true,
        mode: user.emailMode as "demo" | "smtp" | "gmail_compose",
        smtp: user.smtpJson ? JSON.parse(user.smtpJson) : undefined,
      },
      whatsapp: {
        enabled: true,
        mode: (user.whatsappMode === "wa_me" ? "wa_me" : "business_api") as
          | "wa_me"
          | "business_api",
        ownerPhone: user.ownerPhone ?? undefined,
        businessToken: user.whatsappToken ?? undefined,
        phoneNumberId: user.whatsappPhoneId ?? undefined,
      },
      linkedin: {
        enabled: user.linkedinEnabled,
        mode: "manual" as const,
        ownerProfileUrl: user.ownerLinkedIn ?? undefined,
      },
    },
    createdAt: user.createdAt,
  };
}
