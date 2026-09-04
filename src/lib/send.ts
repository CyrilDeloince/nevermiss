import nodemailer from "nodemailer";
import type { ScheduledMessage, Workspace } from "./types";
import { addActivity, updateMessage } from "./store";
import { whatsappDeepLink } from "./messages";
import type { Contact } from "./types";

export type SendResult = {
  id: string;
  status: "sent" | "failed" | "skipped";
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

  if (emailCfg.mode === "demo" || !emailCfg.smtp?.host) {
    await addActivity(
      "sent",
      `[DEMO email] → ${contact.email} : ${message.subject ?? "(sans objet)"}`
    );
    return {
      id: message.id,
      status: "sent",
      detail: `Email simulé vers ${contact.email} (mode démo — configurez SMTP pour l’envoi réel)`,
    };
  }

  const smtp = emailCfg.smtp;
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  await transporter.sendMail({
    from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
    to: contact.email,
    subject: message.subject ?? "Message NeverMiss",
    text: message.body,
  });

  return {
    id: message.id,
    status: "sent",
    detail: `Email envoyé à ${contact.email}`,
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
      detail: "Contact sans téléphone",
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

  // Mode wa.me : file d’attente + lien prêt (envoi 1 clic, sans API payante)
  await addActivity(
    "info",
    `WhatsApp prêt (lien wa.me) pour ${contact.name} — ouvrez le lien pour envoyer`
  );
  return {
    id: message.id,
    status: "sent",
    detail: `Lien WhatsApp généré pour ${contact.name}`,
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
    `LinkedIn prêt pour ${contact.name} — message à coller manuellement (API LinkedIn restreinte)`
  );
  return {
    id: message.id,
    status: "sent",
    detail: `Brouillon LinkedIn prêt pour ${contact.name}`,
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
      status: result.status === "sent" ? "sent" : result.status,
      sentAt: result.status === "sent" ? new Date().toISOString() : undefined,
      error: result.status === "failed" ? result.detail : undefined,
    });

    if (result.status === "sent") {
      await addActivity("sent", result.detail);
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
