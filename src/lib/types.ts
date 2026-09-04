export type PlanId = "free" | "pro" | "enterprise";

export type Channel = "email" | "whatsapp" | "linkedin";

export type Occasion =
  | "birthday"
  | "christmas"
  | "newyear"
  | "promotion"
  | "custom";

export type MessageStatus =
  | "scheduled"
  | "sent"
  | "failed"
  | "skipped"
  | "draft";

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  company?: string;
  birthday?: string; // YYYY-MM-DD
  notes?: string;
  preferredChannels: Channel[];
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  occasion: Occasion;
  channel: Channel;
  subject?: string;
  body: string;
  createdAt: string;
}

export interface SequenceStep {
  id: string;
  dayOffset: number; // relative to event day (0 = day of)
  templateId: string;
  channel: Channel;
}

export interface Sequence {
  id: string;
  name: string;
  occasion: Occasion;
  active: boolean;
  steps: SequenceStep[];
  createdAt: string;
}

export interface ScheduledMessage {
  id: string;
  contactId: string;
  templateId?: string;
  sequenceId?: string;
  channel: Channel;
  occasion: Occasion;
  subject?: string;
  body: string;
  scheduledAt: string; // ISO
  status: MessageStatus;
  error?: string;
  sentAt?: string;
  createdAt: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export interface ChannelSettings {
  email: {
    enabled: boolean;
    mode: "smtp" | "demo";
    smtp?: SmtpSettings;
  };
  whatsapp: {
    enabled: boolean;
    mode: "wa_me" | "business_api";
    businessToken?: string;
    phoneNumberId?: string;
  };
  linkedin: {
    enabled: boolean;
    mode: "manual" | "api";
  };
}

export interface Workspace {
  id: string;
  ownerEmail: string;
  ownerName: string;
  plan: PlanId;
  channels: ChannelSettings;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: "sent" | "scheduled" | "failed" | "plan" | "contact" | "info";
  message: string;
  createdAt: string;
}

export interface AppStore {
  workspace: Workspace | null;
  contacts: Contact[];
  templates: Template[];
  sequences: Sequence[];
  messages: ScheduledMessage[];
  activity: ActivityItem[];
}

export const PLAN_LIMITS: Record<
  PlanId,
  {
    label: string;
    price: string;
    contacts: number;
    sequences: number;
    channels: Channel[];
    description: string;
  }
> = {
  free: {
    label: "Free",
    price: "0 €",
    contacts: 5,
    sequences: 1,
    channels: ["email"],
    description: "Testez sur votre famille — idéal pour valider le flux.",
  },
  pro: {
    label: "Pro",
    price: "20 €/mois",
    contacts: 500,
    sequences: 20,
    channels: ["email", "whatsapp"],
    description: "Pour les commerciaux : vœux auto, séquences, WhatsApp.",
  },
  enterprise: {
    label: "Enterprise",
    price: "Sur devis",
    contacts: 10000,
    sequences: 200,
    channels: ["email", "whatsapp", "linkedin"],
    description: "Équipes sales, LinkedIn, multi-utilisateurs, SLA.",
  },
};
