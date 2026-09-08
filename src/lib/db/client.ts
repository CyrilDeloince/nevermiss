import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

type LibsqlClient = {
  batch: (
    stmts: string[],
    mode?: string
  ) => Promise<unknown>;
};

function resolveUrl() {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  if (process.env.VERCEL) {
    throw new Error(
      "TURSO_DATABASE_URL manquant sur Vercel. Ajoutez-le dans Project Settings → Environment Variables."
    );
  }
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return `file:${path.join(dir, "nevermiss.db")}`;
}

const globalForDb = globalThis as unknown as {
  __nevermiss_client?: LibsqlClient;
};

function getClient(): LibsqlClient {
  if (!globalForDb.__nevermiss_client) {
    const url = resolveUrl();
    const authToken = process.env.TURSO_AUTH_TOKEN;
    // Remote Turso → web client (no native binary — works on Vercel)
    // Local file → node client
    const isRemote =
      url.startsWith("libsql://") || url.startsWith("https://");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = isRemote
      ? require("@libsql/client/web")
      : require("@libsql/client");
    globalForDb.__nevermiss_client = mod.createClient({ url, authToken });
  }
  return globalForDb.__nevermiss_client!;
}

export function getDb() {
  return drizzle(getClient() as never, { schema });
}

export async function ensureSchema() {
  const client = getClient();
  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      role TEXT NOT NULL DEFAULT 'user',
      owner_phone TEXT,
      owner_linkedin TEXT,
      send_time_ami TEXT NOT NULL DEFAULT '10:30',
      send_time_famille TEXT NOT NULL DEFAULT '09:00',
      send_time_travail TEXT NOT NULL DEFAULT '08:45',
      email_mode TEXT NOT NULL DEFAULT 'demo',
      smtp_json TEXT,
      whatsapp_mode TEXT NOT NULL DEFAULT 'cloud_api',
      whatsapp_token TEXT,
      whatsapp_phone_id TEXT,
      linkedin_enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )`,
      `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
      `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      linkedin_url TEXT,
      company TEXT,
      birthday TEXT,
      notes TEXT,
      relation_type TEXT NOT NULL DEFAULT 'ami',
      send_time TEXT,
      preferred_channels TEXT NOT NULL DEFAULT '["email"]',
      created_at TEXT NOT NULL
    )`,
      `CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      occasion TEXT NOT NULL,
      channel TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
      `CREATE TABLE IF NOT EXISTS sequences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      occasion TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      steps_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    )`,
      `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      template_id TEXT,
      sequence_id TEXT,
      channel TEXT NOT NULL,
      occasion TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      error TEXT,
      sent_at TEXT,
      deep_link TEXT,
      created_at TEXT NOT NULL
    )`,
      `CREATE TABLE IF NOT EXISTS activity (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    ],
    "write"
  );
}
