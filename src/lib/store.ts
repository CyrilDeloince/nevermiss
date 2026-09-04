import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  ActivityItem,
  AppStore,
  ChannelSettings,
  Contact,
  ScheduledMessage,
  Sequence,
  SendTimeDefaults,
  Template,
  Workspace,
} from "./types";
import { DEFAULT_SEND_TIMES } from "./types";

const DATA_DIR = process.env.DATA_DIR
  ? process.env.DATA_DIR
  : process.env.VERCEL
    ? path.join(process.env.TMPDIR || "/tmp", "nevermiss-data")
    : path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

const defaultChannels = (): ChannelSettings => ({
  email: {
    enabled: true,
    mode: "gmail_compose",
  },
  whatsapp: {
    enabled: true,
    mode: "wa_me",
  },
  linkedin: {
    enabled: true,
    mode: "manual",
  },
});

function migrateStore(store: AppStore): AppStore {
  if (store.workspace) {
    store.workspace.sendTimeDefaults = {
      ...DEFAULT_SEND_TIMES,
      ...(store.workspace.sendTimeDefaults ?? {}),
    };
    store.workspace.channels = {
      ...defaultChannels(),
      ...store.workspace.channels,
      email: {
        ...defaultChannels().email,
        ...store.workspace.channels?.email,
      },
      whatsapp: {
        ...defaultChannels().whatsapp,
        ...store.workspace.channels?.whatsapp,
      },
      linkedin: {
        ...defaultChannels().linkedin,
        ...store.workspace.channels?.linkedin,
      },
    };
  }
  store.contacts = (store.contacts ?? []).map((c) => ({
    ...c,
    relationType: c.relationType ?? "ami",
    preferredChannels: c.preferredChannels?.length
      ? c.preferredChannels
      : ["whatsapp"],
  }));
  return store;
}

function seedTemplates(): Template[] {
  const now = new Date().toISOString();
  return [
    {
      id: "tpl-bday-email",
      name: "Anniversaire — email chaleureux",
      occasion: "birthday",
      channel: "email",
      subject: "Joyeux anniversaire {{prenom}} 🎂",
      body: `Bonjour {{prenom}},

Je voulais simplement te souhaiter un excellent anniversaire !

Que cette nouvelle année te apporte santé, projets réussis et de belles rencontres.

À très vite,
{{signature}}`,
      createdAt: now,
    },
    {
      id: "tpl-bday-wa",
      name: "Anniversaire — WhatsApp court",
      occasion: "birthday",
      channel: "whatsapp",
      body: `Hey {{prenom}} ! Joyeux anniversaire 🎉 Passe une super journée — on se tient au courant bientôt !`,
      createdAt: now,
    },
    {
      id: "tpl-bday-li",
      name: "Anniversaire — LinkedIn",
      occasion: "birthday",
      channel: "linkedin",
      body: `Joyeux anniversaire {{prenom}} ! 🎂 Passe une excellente journée — au plaisir d’échanger bientôt.`,
      createdAt: now,
    },
    {
      id: "tpl-xmas",
      name: "Noël — email",
      occasion: "christmas",
      channel: "email",
      subject: "Joyeux Noël {{prenom}}",
      body: `Cher(e) {{prenom}},

Joyeux Noël à toi et à ceux qui t'entourent.

Merci pour la confiance et les échanges de cette année. Au plaisir de continuer ensemble en {{annee}}.

{{signature}}`,
      createdAt: now,
    },
    {
      id: "tpl-newyear",
      name: "Bonne année — email",
      occasion: "newyear",
      channel: "email",
      subject: "Bonne année {{prenom}} !",
      body: `Bonjour {{prenom}},

Tous mes vœux pour {{annee}} : santé, ambition et belles opportunités.

Hâte de collaborer à nouveau cette année.

{{signature}}`,
      createdAt: now,
    },
    {
      id: "tpl-promo-li",
      name: "Félicitations LinkedIn — nouveau poste",
      occasion: "promotion",
      channel: "linkedin",
      body: `Bravo {{prenom}} pour ton nouveau poste chez {{entreprise}} ! C’est mérité — je te souhaite une belle réussite dans cette aventure.`,
      createdAt: now,
    },
  ];
}

function seedSequences(): Sequence[] {
  const now = new Date().toISOString();
  return [
    {
      id: "seq-birthday",
      name: "Séquence anniversaire",
      occasion: "birthday",
      active: true,
      steps: [
        {
          id: "step-1",
          dayOffset: 0,
          templateId: "tpl-bday-wa",
          channel: "whatsapp",
        },
        {
          id: "step-2",
          dayOffset: 0,
          templateId: "tpl-bday-email",
          channel: "email",
        },
        {
          id: "step-3",
          dayOffset: 0,
          templateId: "tpl-bday-li",
          channel: "linkedin",
        },
      ],
      createdAt: now,
    },
  ];
}

function emptyStore(): AppStore {
  return {
    workspace: null,
    contacts: [],
    templates: seedTemplates(),
    sequences: seedSequences(),
    messages: [],
    activity: [],
  };
}

async function ensureStore(): Promise<AppStore> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const store = migrateStore(JSON.parse(raw) as AppStore);
    return store;
  } catch {
    const store = emptyStore();
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
    return store;
  }
}

async function writeStore(store: AppStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function pushActivity(
  store: AppStore,
  type: ActivityItem["type"],
  message: string
) {
  store.activity.unshift({
    id: randomUUID(),
    type,
    message,
    createdAt: new Date().toISOString(),
  });
  store.activity = store.activity.slice(0, 100);
}

export async function getStore(): Promise<AppStore> {
  return ensureStore();
}

export async function resetStore(): Promise<AppStore> {
  const store = emptyStore();
  await writeStore(store);
  return store;
}

export async function createWorkspace(input: {
  email: string;
  name: string;
}): Promise<Workspace> {
  const store = await ensureStore();
  const workspace: Workspace = {
    id: randomUUID(),
    ownerEmail: input.email.trim().toLowerCase(),
    ownerName: input.name.trim() || "Utilisateur",
    plan: "free",
    channels: defaultChannels(),
    sendTimeDefaults: { ...DEFAULT_SEND_TIMES },
    createdAt: new Date().toISOString(),
  };
  store.workspace = workspace;
  pushActivity(store, "plan", `Espace créé — plan Free activé pour ${workspace.ownerEmail}`);
  await writeStore(store);
  return workspace;
}

export async function updatePlan(plan: Workspace["plan"]): Promise<Workspace> {
  const store = await ensureStore();
  if (!store.workspace) throw new Error("Aucun espace de travail");
  store.workspace.plan = plan;
  pushActivity(store, "plan", `Plan mis à jour : ${plan}`);
  await writeStore(store);
  return store.workspace;
}

export async function updateChannels(
  channels: ChannelSettings
): Promise<ChannelSettings> {
  const store = await ensureStore();
  if (!store.workspace) throw new Error("Aucun espace de travail");
  store.workspace.channels = channels;
  pushActivity(store, "info", "Canaux mis à jour");
  await writeStore(store);
  return channels;
}

export async function updateProfile(input: {
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerLinkedIn?: string;
  sendTimeDefaults?: SendTimeDefaults;
}): Promise<Workspace> {
  const store = await ensureStore();
  if (!store.workspace) throw new Error("Aucun espace de travail");
  if (input.ownerName !== undefined) store.workspace.ownerName = input.ownerName;
  if (input.ownerEmail !== undefined)
    store.workspace.ownerEmail = input.ownerEmail.trim().toLowerCase();
  if (input.ownerPhone !== undefined) {
    store.workspace.ownerPhone = input.ownerPhone;
    store.workspace.channels.whatsapp.ownerPhone = input.ownerPhone;
    store.workspace.channels.whatsapp.enabled = true;
  }
  if (input.ownerLinkedIn !== undefined) {
    store.workspace.ownerLinkedIn = input.ownerLinkedIn;
    store.workspace.channels.linkedin.ownerProfileUrl = input.ownerLinkedIn;
    store.workspace.channels.linkedin.enabled = true;
  }
  if (input.sendTimeDefaults) {
    store.workspace.sendTimeDefaults = input.sendTimeDefaults;
  }
  pushActivity(store, "info", "Profil & horaires mis à jour");
  await writeStore(store);
  return store.workspace;
}

export async function listContacts(): Promise<Contact[]> {
  return (await ensureStore()).contacts;
}

export async function upsertContact(
  contact: Omit<Contact, "id" | "createdAt"> & { id?: string }
): Promise<Contact> {
  const store = await ensureStore();
  if (contact.id) {
    const idx = store.contacts.findIndex((c) => c.id === contact.id);
    if (idx === -1) throw new Error("Contact introuvable");
    store.contacts[idx] = {
      ...store.contacts[idx],
      ...contact,
      id: contact.id,
    };
    await writeStore(store);
    return store.contacts[idx];
  }
  const created: Contact = {
    ...contact,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  store.contacts.unshift(created);
  pushActivity(store, "contact", `Contact ajouté : ${created.name}`);
  await writeStore(store);
  return created;
}

export async function deleteContact(id: string): Promise<void> {
  const store = await ensureStore();
  store.contacts = store.contacts.filter((c) => c.id !== id);
  await writeStore(store);
}

export async function listTemplates(): Promise<Template[]> {
  return (await ensureStore()).templates;
}

export async function upsertTemplate(
  template: Omit<Template, "id" | "createdAt"> & { id?: string }
): Promise<Template> {
  const store = await ensureStore();
  if (template.id) {
    const idx = store.templates.findIndex((t) => t.id === template.id);
    if (idx === -1) throw new Error("Modèle introuvable");
    store.templates[idx] = {
      ...store.templates[idx],
      ...template,
      id: template.id,
    };
    await writeStore(store);
    return store.templates[idx];
  }
  const created: Template = {
    ...template,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  store.templates.unshift(created);
  await writeStore(store);
  return created;
}

export async function deleteTemplate(id: string): Promise<void> {
  const store = await ensureStore();
  store.templates = store.templates.filter((t) => t.id !== id);
  await writeStore(store);
}

export async function listSequences(): Promise<Sequence[]> {
  return (await ensureStore()).sequences;
}

export async function upsertSequence(
  sequence: Omit<Sequence, "id" | "createdAt"> & { id?: string }
): Promise<Sequence> {
  const store = await ensureStore();
  if (sequence.id) {
    const idx = store.sequences.findIndex((s) => s.id === sequence.id);
    if (idx === -1) throw new Error("Séquence introuvable");
    store.sequences[idx] = {
      ...store.sequences[idx],
      ...sequence,
      id: sequence.id,
    };
    await writeStore(store);
    return store.sequences[idx];
  }
  const created: Sequence = {
    ...sequence,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  store.sequences.unshift(created);
  await writeStore(store);
  return created;
}

export async function listMessages(): Promise<ScheduledMessage[]> {
  return (await ensureStore()).messages;
}

export async function saveMessages(
  messages: ScheduledMessage[]
): Promise<void> {
  const store = await ensureStore();
  store.messages = messages;
  await writeStore(store);
}

export async function addMessages(
  messages: ScheduledMessage[]
): Promise<ScheduledMessage[]> {
  const store = await ensureStore();
  store.messages = [...messages, ...store.messages];
  for (const m of messages) {
    pushActivity(
      store,
      "scheduled",
      `Message programmé (${m.channel}) pour le ${new Date(m.scheduledAt).toLocaleString("fr-FR")}`
    );
  }
  await writeStore(store);
  return messages;
}

export async function updateMessage(
  id: string,
  patch: Partial<ScheduledMessage>
): Promise<ScheduledMessage> {
  const store = await ensureStore();
  const idx = store.messages.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error("Message introuvable");
  store.messages[idx] = { ...store.messages[idx], ...patch };
  await writeStore(store);
  return store.messages[idx];
}

export async function addActivity(
  type: ActivityItem["type"],
  message: string
): Promise<void> {
  const store = await ensureStore();
  pushActivity(store, type, message);
  await writeStore(store);
}
