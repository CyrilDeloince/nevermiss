import type { Channel } from "@/lib/types";

export type GuideLink = { label: string; href: string };

export type GuideAction = {
  id: string;
  label: string;
  kind: "send-now" | "schedule-upcoming" | "process-due" | "open";
  contactId?: string;
  contactName?: string;
  channel?: Channel;
  href?: string;
};

export type GuideReply = {
  answer: string;
  links: GuideLink[];
  actions: GuideAction[];
};

export type GuideContact = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  preferredChannels?: Channel[];
};

function findContact(question: string, contacts: GuideContact[]): GuideContact | null {
  const q = question.toLowerCase();
  const sorted = [...contacts].sort((a, b) => b.name.length - a.name.length);
  for (const c of sorted) {
    const first = c.name.split(/\s+/)[0]?.toLowerCase();
    const full = c.name.toLowerCase();
    if (full.length > 2 && q.includes(full)) return c;
    if (first && first.length > 2 && q.includes(first)) return c;
  }
  return null;
}

function detectChannel(q: string): Channel | null {
  if (q.includes("whatsapp") || q.includes("wa ")) return "whatsapp";
  if (q.includes("linkedin")) return "linkedin";
  if (q.includes("gmail") || q.includes("email") || q.includes("mail")) return "email";
  return null;
}

function wantsSend(q: string): boolean {
  return (
    q.includes("send") ||
    q.includes("envoyer") ||
    q.includes("envoi") ||
    q.includes("message") ||
    q.includes("wish") ||
    q.includes("anniv") ||
    q.includes("birthday") ||
    q.includes("souhait")
  );
}

function wantsSchedule(q: string): boolean {
  return (
    q.includes("schedule") ||
    q.includes("program") ||
    q.includes("planif") ||
    q.includes("run the engine") ||
    q.includes("moteur")
  );
}

function wantsAddContact(q: string): boolean {
  return (
    (q.includes("add") || q.includes("ajout") || q.includes("créer") || q.includes("create")) &&
    (q.includes("contact") || q.includes("person") || q.includes("client"))
  );
}

/** Build a guide reply that explains AND offers to do the work. */
export function answerGuideQuestion(
  question: string,
  contacts: GuideContact[] = []
): GuideReply {
  const raw = question.trim();
  const q = raw.toLowerCase();
  const contact = findContact(q, contacts);
  const channel = detectChannel(q);

  if (!q) {
    return {
      answer:
        "Tell me what you want. I can explain the steps, or do it for you when you say yes.",
      links: [
        { label: "Send queue", href: "/app/messages" },
        { label: "Contacts", href: "/app/contacts" },
      ],
      actions: [],
    };
  }

  if (wantsSend(q) || channel) {
    const pickedChannel =
      channel ||
      contact?.preferredChannels?.[0] ||
      ("whatsapp" as Channel);

    if (contact) {
      return {
        answer: `I can send a ${pickedChannel} message to ${contact.name} for you now.\n\nManual path: Send queue → Send now → ${pickedChannel}.\n\nWant me to do it?`,
        links: [
          { label: "Send queue", href: "/app/messages" },
          { label: "Contacts", href: "/app/contacts" },
        ],
        actions: [
          {
            id: `send-${contact.id}-${pickedChannel}`,
            label: `Yes, send ${pickedChannel} to ${contact.name.split(" ")[0]}`,
            kind: "send-now",
            contactId: contact.id,
            contactName: contact.name,
            channel: pickedChannel,
          },
          {
            id: "open-messages",
            label: "I will do it myself",
            kind: "open",
            href: "/app/messages",
          },
        ],
      };
    }

    const people = contacts.slice(0, 4);
    if (people.length > 0) {
      return {
        answer: `Who should receive it? Pick someone below, or name them (ex: “send WhatsApp to Sophie”).\n\nManual path: Send queue → Send now.`,
        links: [{ label: "Send queue", href: "/app/messages" }],
        actions: people.map((c) => ({
          id: `send-${c.id}-${channel || "whatsapp"}`,
          label: `Send to ${c.name.split(" ")[0]}`,
          kind: "send-now" as const,
          contactId: c.id,
          contactName: c.name,
          channel: (channel ||
            c.preferredChannels?.[0] ||
            "whatsapp") as Channel,
        })),
      };
    }

    return {
      answer:
        "Add a contact first, then ask me again — or open Send queue and send yourself.",
      links: [
        { label: "Contacts", href: "/app/contacts" },
        { label: "Send queue", href: "/app/messages" },
      ],
      actions: [
        {
          id: "open-contacts",
          label: "Open contacts",
          kind: "open",
          href: "/app/contacts",
        },
      ],
    };
  }

  if (wantsSchedule(q)) {
    return {
      answer:
        "I can schedule upcoming birthdays and process due sends for you now.\n\nManual path: Overview → Schedule & send.",
      links: [{ label: "Overview", href: "/app" }],
      actions: [
        {
          id: "run-schedule",
          label: "Yes, schedule & send for me",
          kind: "schedule-upcoming",
        },
        {
          id: "open-app",
          label: "I will do it myself",
          kind: "open",
          href: "/app",
        },
      ],
    };
  }

  if (wantsAddContact(q)) {
    return {
      answer:
        "I cannot invent a full contact from chat alone yet. Open Contacts and add name, birthday, and channels — or tell me after they exist: “send WhatsApp to Sophie”.",
      links: [{ label: "Contacts", href: "/app/contacts" }],
      actions: [
        {
          id: "open-contacts",
          label: "Open contacts",
          kind: "open",
          href: "/app/contacts",
        },
      ],
    };
  }

  if (q.includes("horaire") || q.includes("send time") || q.includes("schedule time")) {
    return {
      answer:
        "Friend 10:30, family 09:00, work 08:45 by default. Change them in Plan & settings, or set a time on each contact.",
      links: [
        { label: "Plan & settings", href: "/app/settings" },
        { label: "Contacts", href: "/app/contacts" },
      ],
      actions: [
        {
          id: "open-settings",
          label: "Open settings",
          kind: "open",
          href: "/app/settings",
        },
      ],
    };
  }

  return {
    answer:
      "Try: “send WhatsApp to Sophie”, “schedule upcoming”, or “add a contact”. I explain the path, then I can do it when you confirm.",
    links: [
      { label: "Overview", href: "/app" },
      { label: "Send queue", href: "/app/messages" },
      { label: "Contacts", href: "/app/contacts" },
    ],
    actions: [],
  };
}

export async function runGuideAction(action: GuideAction): Promise<string> {
  if (action.kind === "open") {
    return action.href
      ? `Opening ${action.href}`
      : "Opened.";
  }

  if (action.kind === "send-now" && action.contactId && action.channel) {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send-now",
        contactId: action.contactId,
        channel: action.channel,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Send failed");
    const status = data.result?.status || data.message?.status || "done";
    const name = action.contactName || "contact";
    const link = data.result?.deepLink as string | undefined;
    if (link && typeof window !== "undefined") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
    return `Done. ${action.channel} for ${name} is ${status}${
      data.result?.detail ? ` (${data.result.detail})` : ""
    }.`;
  }

  if (action.kind === "schedule-upcoming") {
    const schedule = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "schedule-upcoming" }),
    }).then((r) => r.json());
    const process = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "process-due" }),
    }).then((r) => r.json());
    return `Scheduled ${schedule.created ?? 0}. Processed ${process.processed ?? 0}.`;
  }

  if (action.kind === "process-due") {
    const process = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "process-due" }),
    }).then((r) => r.json());
    return `Processed ${process.processed ?? 0} due messages.`;
  }

  return "Nothing to run.";
}
