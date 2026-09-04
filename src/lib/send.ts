import nodemailer from "nodemailer";
import type { Contact, ScheduledMessage, Workspace } from "./types";
import { addActivity, updateMessage } from "./store";
import {
  gmailComposeLink,
  mailtoLink,
  whatsappDeepLink,
} from "./messages";

export type SendResult = {
  id: string;
  status: "sent" | "ready" | "failed" | "skipped";
  detail: string;
  deepLink?: string;
};

async function sendEmail(
  workspace: Workspace,
  message: ScheduledMessage,
  contact: Contact
): Promise<SendResult> {
  const emailCfg = workspace.channels.email;
  if (!contact.email) {
    return {
      id: message.id,
      status: "failed",
      detail: "Contact sans email",
    };
  }

  const subject = message.subject ?? "Message NeverMiss";

  if (emailCfg.mode === "smtp" && emailCfg.smtp?.host) {
    const smtp = emailCfg.smtp;
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    });
    await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to: contact.email,
      subject,
      text: message.body,
    });
    return {
      id: message.id,
      status: "sent",
      detail: `Email envoyé à ${contact.email}`,
    };
  }

  // Gmail compose / mailto : 1 clic depuis ton compte Google
  const deepLink =
    emailCfg.mode === "gmail_compose" || emailCfg.mode === "demo"
      ? gmailComposeLink(contact.email, subject, message.body)
      : mailtoLink(contact.email, subject, message.body);

  await addActivity(
    "info",
    `Gmail prêt pour ${contact.name} — ouvrez le lien pour envoyer depuis votre boîte`
  );
  return {
    id: message.id,
    status: "ready",
    detail: `Ouvrir Gmail pour envoyer à ${contact.email}`,
    deepLink,
  };
}

async function sendWhatsApp(
  workspace: Workspace,
  message: ScheduledMessage,
  contact: Contact
): Promise<SendResult> {
  if (!contact.phone) {
    return {
      id: message.id,
      status: "failed",
      detail:
        "Contact sans téléphone WhatsApp — ajoutez le numéro du destinataire",
    };
  }

  const link = whatsappDeepLink(contact.phone, message.body);

  if (workspace.channels.whatsapp.mode === "business_api") {
    const token = workspace.channels.whatsapp.businessToken;
    const phoneId = workspace.channels.whatsapp.phoneNumberId;
    if (!token || !phoneId) {
      return {
        id: message.id,
        status: "failed",
        detail: "WhatsApp Business API non configurée",
      };
    }
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
          to: contact.phone.replace(/[^\d]/g, ""),
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
        detail: `WhatsApp API erreur: ${err}`,
      };
    }
    return {
      id: message.id,
      status: "sent",
      detail: `WhatsApp Business envoyé à ${contact.phone}`,
    };
  }

  const from = workspace.ownerPhone || workspace.channels.whatsapp.ownerPhone;
  await addActivity(
    "info",
    `WhatsApp prêt pour ${contact.name}${from ? ` (depuis ${from})` : ""} — 1 clic pour ouvrir la conversation`
  );
  return {
    id: message.id,
    status: "ready",
    detail: `Ouvrir WhatsApp pour ${contact.name}`,
    deepLink: link,
  };
}

async function sendLinkedIn(
  message: ScheduledMessage,
  contact: Contact
): Promise<SendResult> {
  if (!contact.linkedinUrl) {
    return {
      id: message.id,
      status: "failed",
      detail: "Contact sans URL LinkedIn",
    };
  }
  await addActivity(
    "info",
    `LinkedIn prêt pour ${contact.name} — ouvrez le profil et collez le message`
  );
  return {
    id: message.id,
    status: "ready",
    detail: `Ouvrir LinkedIn pour ${contact.name}`,
    deepLink: contact.linkedinUrl,
  };
}

export async function dispatchMessage(
  workspace: Workspace,
  message: ScheduledMessage,
  contact: Contact
): Promise<SendResult> {
  try {
    let result: SendResult;
    if (message.channel === "email") {
      result = await sendEmail(workspace, message, contact);
    } else if (message.channel === "whatsapp") {
      result = await sendWhatsApp(workspace, message, contact);
    } else {
      result = await sendLinkedIn(message, contact);
    }

    await updateMessage(message.id, {
      status:
        result.status === "sent"
          ? "sent"
          : result.status === "ready"
            ? "ready"
            : result.status,
      sentAt:
        result.status === "sent" || result.status === "ready"
          ? new Date().toISOString()
          : undefined,
      deepLink: result.deepLink,
      error: result.status === "failed" ? result.detail : undefined,
    });

    if (result.status === "sent" || result.status === "ready") {
      await addActivity(
        result.status === "sent" ? "sent" : "info",
        result.detail
      );
    } else if (result.status === "failed") {
      await addActivity("failed", result.detail);
    }

    return result;
  } catch (e) {
    const detail = e instanceof Error ? e.message : "Erreur d’envoi";
    await updateMessage(message.id, { status: "failed", error: detail });
    await addActivity("failed", detail);
    return { id: message.id, status: "failed", detail };
  }
}
