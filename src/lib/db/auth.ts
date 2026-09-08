import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { eq, and, gt, isNull } from "drizzle-orm";
import { getDb, ensureSchema } from "./client";
import { sessions, users, templates, sequences, contacts } from "./schema";
import type { PlanId } from "../types";

const SESSION_COOKIE = "nm_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  plan: PlanId;
  role: "user" | "admin";
  ownerPhone?: string | null;
  ownerLinkedIn?: string | null;
  sendTimeAmi: string;
  sendTimeFamille: string;
  sendTimeTravail: string;
  emailMode: string;
  smtpJson?: string | null;
  whatsappMode: string;
  whatsappToken?: string | null;
  whatsappPhoneId?: string | null;
  linkedinEnabled: boolean;
  createdAt: string;
};

function mapUser(row: typeof users.$inferSelect): SessionUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    plan: row.plan as PlanId,
    role: row.role as "user" | "admin",
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

async function seedTemplates(userId: string) {
  const db = getDb();
  const now = new Date().toISOString();
  const rows = [
    {
      id: randomUUID(),
      userId,
      name: "Anniversaire — chaleureux",
      occasion: "birthday",
      channel: "email",
      subject: "Joyeux anniversaire {{prenom}}",
      body: `Bonjour {{prenom}},\n\nJe voulais simplement te souhaiter un excellent anniversaire.\n\nQue cette année t’apporte santé et belles réussites.\n\nÀ très vite,\n{{signature}}`,
      createdAt: now,
    },
    {
      id: randomUUID(),
      userId,
      name: "Anniversaire — court",
      occasion: "birthday",
      channel: "whatsapp",
      subject: null as string | null,
      body: `Hey {{prenom}} ! Joyeux anniversaire — passe une super journée !`,
      createdAt: now,
    },
    {
      id: randomUUID(),
      userId,
      name: "Noël",
      occasion: "christmas",
      channel: "email",
      subject: "Joyeux Noël {{prenom}}",
      body: `Cher(e) {{prenom}},\n\nJoyeux Noël à toi et à ceux qui t’entourent.\n\n{{signature}}`,
      createdAt: now,
    },
    {
      id: randomUUID(),
      userId,
      name: "Bonne année",
      occasion: "newyear",
      channel: "email",
      subject: "Bonne année {{prenom}}",
      body: `Bonjour {{prenom}},\n\nTous mes vœux pour {{annee}}.\n\n{{signature}}`,
      createdAt: now,
    },
    {
      id: randomUUID(),
      userId,
      name: "Nouveau poste",
      occasion: "promotion",
      channel: "linkedin",
      subject: null,
      body: `Bravo {{prenom}} pour ton nouveau poste chez {{entreprise}} ! Je te souhaite une belle réussite.`,
      createdAt: now,
    },
  ];
  for (const row of rows) await db.insert(templates).values(row);

  const wa = rows[1];
  const em = rows[0];
  await db.insert(sequences).values({
    id: randomUUID(),
    userId,
    name: "Séquence anniversaire",
    occasion: "birthday",
    active: true,
    stepsJson: JSON.stringify([
      { id: randomUUID(), dayOffset: 0, templateId: wa.id, channel: "whatsapp" },
      { id: randomUUID(), dayOffset: 0, templateId: em.id, channel: "email" },
    ]),
    createdAt: now,
  });
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  plan?: PlanId;
  role?: "user" | "admin";
}): Promise<SessionUser> {
  await ensureSchema();
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.insert(users).values({
    id,
    email: input.email.trim().toLowerCase(),
    passwordHash: hashPassword(input.password),
    name: input.name.trim(),
    plan: input.plan ?? "free",
    role: input.role ?? "user",
    createdAt: now,
  });
  await seedTemplates(id);
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return mapUser(user);
}

export async function ensureSeedUsers() {
  await ensureSchema();
  const db = getDb();
  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@nevermiss.app"))
    .limit(1);
  if (!admin) {
    await createUser({
      email: "admin@nevermiss.app",
      password: "nevermiss2026",
      name: "Cyril (Admin)",
      plan: "enterprise",
      role: "admin",
    });
  }
  const [demo] = await db
    .select()
    .from(users)
    .where(eq(users.email, "demo@nevermiss.app"))
    .limit(1);
  if (!demo) {
    const demoUser = await createUser({
      email: "demo@nevermiss.app",
      password: "demo2026",
      name: "Alex Martin",
      plan: "pro",
      role: "user",
    });
    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    await db.insert(contacts).values([
      {
        id: randomUUID(),
        userId: demoUser.id,
        name: "Sophie Dupont",
        email: "sophie@exemple.fr",
        phone: "+33612345678",
        company: "Acme",
        birthday: `${year}-${mm}-${dd}`,
        notes: "Hey Sophie ! Joyeux anniversaire — passe une super journée !",
        relationType: "ami",
        preferredChannels: JSON.stringify(["email", "whatsapp"]),
        createdAt: now,
      },
      {
        id: randomUUID(),
        userId: demoUser.id,
        name: "Marc Lefevre",
        email: "marc@client.fr",
        phone: "+33698765432",
        company: "Client SA",
        birthday: `${year}-12-15`,
        relationType: "travail",
        preferredChannels: JSON.stringify(["email"]),
        createdAt: now,
      },
    ]);
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: SessionUser; token: string }> {
  await ensureSeedUsers();
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Email ou mot de passe incorrect");
  }
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86400000);
  await db.insert(sessions).values({
    id: randomUUID(),
    userId: user.id,
    token,
    expiresAt: expires.toISOString(),
    createdAt: now.toISOString(),
  });
  return { user: mapUser(user), token };
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  await ensureSeedUsers();
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date().toISOString())
      )
    )
    .limit(1);
  if (!session) return null;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (!user) return null;
  await ensureUserContent(user.id);
  return mapUser(user);
}

/** Répare templates/séquences manquants (ex. comptes créés avant le seed complet) */
async function ensureUserContent(userId: string) {
  const db = getDb();
  // purge templates with null ids (bug insert)
  try {
    await db.delete(templates).where(and(eq(templates.userId, userId), isNull(templates.id)));
  } catch {
    /* ignore */
  }

  const tpls = await db.select().from(templates).where(eq(templates.userId, userId));
  const byChannel = new Map(tpls.map((t) => [t.channel, t]));
  const now = new Date().toISOString();

  async function ensureTpl(
    channel: string,
    name: string,
    body: string,
    subject?: string
  ) {
    if (byChannel.has(channel)) return byChannel.get(channel)!;
    const id = randomUUID();
    const row = {
      id,
      userId,
      name,
      occasion: "birthday",
      channel,
      subject: subject ?? null,
      body,
      createdAt: now,
    };
    await db.insert(templates).values(row);
    byChannel.set(channel, row as (typeof tpls)[0]);
    return row as (typeof tpls)[0];
  }

  const wa = await ensureTpl(
    "whatsapp",
    "Anniversaire — court",
    `Hey {{prenom}} ! Joyeux anniversaire — passe une super journée !`
  );
  const em = await ensureTpl(
    "email",
    "Anniversaire — chaleureux",
    `Bonjour {{prenom}},\n\nJe voulais simplement te souhaiter un excellent anniversaire.\n\nQue cette année t’apporte santé et belles réussites.\n\nÀ très vite,\n{{signature}}`,
    "Joyeux anniversaire {{prenom}}"
  );
  const li = await ensureTpl(
    "linkedin",
    "Anniversaire — LinkedIn",
    `Joyeux anniversaire {{prenom}} ! Belle continuation pour cette nouvelle année.`
  );

  const seqs = await db.select().from(sequences).where(eq(sequences.userId, userId));
  const hasBirthday = seqs.some((s) => s.occasion === "birthday" && s.active);
  if (!hasBirthday) {
    await db.insert(sequences).values({
      id: randomUUID(),
      userId,
      name: "Séquence anniversaire",
      occasion: "birthday",
      active: true,
      stepsJson: JSON.stringify([
        { id: randomUUID(), dayOffset: 0, templateId: wa.id, channel: "whatsapp" },
        { id: randomUUID(), dayOffset: 0, templateId: em.id, channel: "email" },
        { id: randomUUID(), dayOffset: 0, templateId: li.id, channel: "linkedin" },
      ]),
      createdAt: now,
    });
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Non connecté");
  return user;
}

export async function logoutCurrent() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  await clearSessionCookie();
}
