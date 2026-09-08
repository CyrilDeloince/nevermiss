import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("free"), // free | pro | enterprise
  role: text("role").notNull().default("user"), // user | admin
  ownerPhone: text("owner_phone"),
  ownerLinkedIn: text("owner_linkedin"),
  sendTimeAmi: text("send_time_ami").notNull().default("10:30"),
  sendTimeFamille: text("send_time_famille").notNull().default("09:00"),
  sendTimeTravail: text("send_time_travail").notNull().default("08:45"),
  // Channel config JSON
  emailMode: text("email_mode").notNull().default("demo"), // demo | smtp | gmail_compose
  smtpJson: text("smtp_json"),
  whatsappMode: text("whatsapp_mode").notNull().default("cloud_api"), // cloud_api | wa_me
  whatsappToken: text("whatsapp_token"),
  whatsappPhoneId: text("whatsapp_phone_id"),
  linkedinEnabled: integer("linkedin_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  linkedinUrl: text("linkedin_url"),
  company: text("company"),
  birthday: text("birthday"),
  notes: text("notes"),
  relationType: text("relation_type").notNull().default("ami"),
  sendTime: text("send_time"),
  preferredChannels: text("preferred_channels").notNull().default('["email"]'),
  createdAt: text("created_at").notNull(),
});

export const templates = sqliteTable("templates", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  occasion: text("occasion").notNull(),
  channel: text("channel").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sequences = sqliteTable("sequences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  occasion: text("occasion").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  stepsJson: text("steps_json").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contactId: text("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  templateId: text("template_id"),
  sequenceId: text("sequence_id"),
  channel: text("channel").notNull(),
  occasion: text("occasion").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  scheduledAt: text("scheduled_at").notNull(),
  status: text("status").notNull().default("scheduled"),
  error: text("error"),
  sentAt: text("sent_at"),
  deepLink: text("deep_link"),
  createdAt: text("created_at").notNull(),
});

export const activity = sqliteTable("activity", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});
