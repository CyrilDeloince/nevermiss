import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { getDb } from "./db/client";
import { messages } from "./db/schema";
import { addActivity } from "./db/repo";
import { normalizePhone, whatsappDeepLink } from "./messages";
import type { SessionUser } from "./db/auth";

export type ContactRow = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  company?: string | null;
};

export type MessageRow = {
  id: string;
  channel: string;
  subject?: string | null;
  body: string;
};

export type SendResult = {
  id: string;
  status: "sent" | "ready" | "failed" | "skipped";
  detail: string;
  deepLink?: string;
};

/**
 * Envoi silencieux en arrière-plan :
 * - Email SMTP → vraiment envoyé sans ouvrir de fenêtre
 * - WhatsApp Cloud API (Meta) → vraiment envoyé sans ouvrir WhatsApp
 * - Sans Cloud API, WhatsApp ne peut PAS partir en silence (limitation Meta)
 */
async function sendEmail(
  user: SessionUser,
  message: MessageRow,
  contact: ContactRow
): Promise<SendResult> {
  if (!contact.email) {
    return { id: message.id, status: "failed", detail: "Contact sans email" };
  }

  if (user.emailMode === "smtp" && user.smtpJson) {
    const smtp = JSON.parse(user.smtpJson) as {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
      fromName: string;
      fromEmail: string;
    };
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    });
    await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to: contact.email,
      subject: message.subject ?? "Message from Jardin",
      text: message.body,
    });
    return {
      id: message.id,
      status: "sent",
      detail: `Email envoyé silencieusement à ${contact.email}`,
    };
  }

  // Mode démo : simule l’envoi auto (pour la démo sales sans SMTP)
  if (user.emailMode === "demo") {
    return {
      id: message.id,
      status: "sent",
      detail: `[Démo] Email considéré envoyé à ${contact.email} (configurez SMTP pour l’envoi réel silencieux)`,
    };
  }

  return {
    id: message.id,
    status: "failed",
    detail: "Configurez SMTP dans Canaux pour un envoi email automatique",
  };
}

async function sendWhatsApp(
  user: SessionUser,
  message: MessageRow,
  contact: ContactRow
): Promise<SendResult> {
  if (!contact.phone) {
    return {
      id: message.id,
      status: "failed",
      detail: "Contact sans téléphone WhatsApp",
    };
  }

  const token = user.whatsappToken;
  const phoneId = user.whatsappPhoneId;

  // Vrai envoi background via Meta Cloud API
  if (token && phoneId) {
    const to = normalizePhone(contact.phone).replace(/^\+/, "");
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message.body },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      return {
        id: message.id,
        status: "failed",
        detail: `WhatsApp API : ${err.slice(0, 200)}`,
      };
    }
    return {
      id: message.id,
      status: "sent",
      detail: `WhatsApp envoyé en arrière-plan à ${contact.name} (sans ouvrir l’app)`,
    };
  }

  // Sans API Meta : impossible d’envoyer en silence légalement
  return {
    id: message.id,
    status: "failed",
    detail:
      "WhatsApp automatique nécessite WhatsApp Business API (Meta) dans Canaux. Sans ça, Meta interdit l’envoi silencieux.",
  };
}

async function sendLinkedIn(
  message: MessageRow,
  contact: ContactRow
): Promise<SendResult> {
  if (!contact.linkedinUrl) {
    return {
      id: message.id,
      status: "failed",
      detail: "Contact sans URL LinkedIn",
    };
  }
  // API messaging LinkedIn fermée — on enregistre le brouillon
  return {
    id: message.id,
    status: "ready",
    detail: `Brouillon LinkedIn prêt pour ${contact.name} (API LinkedIn fermée — à poster manuellement)`,
    deepLink: contact.linkedinUrl,
  };
}

export async function dispatchMessage(
  user: SessionUser,
  message: MessageRow,
  contact: ContactRow
): Promise<SendResult> {
  try {
    let result: SendResult;
    if (message.channel === "email") {
      result = await sendEmail(user, message, contact);
    } else if (message.channel === "whatsapp") {
      result = await sendWhatsApp(user, message, contact);
    } else {
      result = await sendLinkedIn(message, contact);
    }

    const db = getDb();
    await db
      .update(messages)
      .set({
        status: result.status,
        sentAt:
          result.status === "sent" || result.status === "ready"
            ? new Date().toISOString()
            : null,
        deepLink: result.deepLink ?? null,
        error: result.status === "failed" ? result.detail : null,
      })
      .where(eq(messages.id, message.id));

    await addActivity(
      user.id,
      result.status === "failed" ? "failed" : "sent",
      result.detail
    );
    return result;
  } catch (e) {
    const detail = e instanceof Error ? e.message : "Erreur d’envoi";
    const db = getDb();
    await db
      .update(messages)
      .set({ status: "failed", error: detail })
      .where(eq(messages.id, message.id));
    await addActivity(user.id, "failed", detail);
    return { id: message.id, status: "failed", detail };
  }
}

// re-export helper used elsewhere
export { whatsappDeepLink };
