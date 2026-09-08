import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/db/auth";
import {
  listActivity,
  listContacts,
  listMessages,
  listSequences,
  listTemplates,
  updateUserProfile,
  userToWorkspace,
} from "@/lib/db/repo";
import { DEFAULT_SEND_TIMES, type PlanId } from "@/lib/types";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  return NextResponse.json({
    workspace: userToWorkspace(user),
    activity: await listActivity(user.id),
    defaults: DEFAULT_SEND_TIMES,
    contactsCount: (await listContacts(user.id)).length,
    messagesCount: (await listMessages(user.id)).length,
    templatesCount: (await listTemplates(user.id)).length,
    sequencesCount: (await listSequences(user.id)).length,
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const body = await req.json();
  try {
    if (body.action === "set-plan") {
      const plan = z.enum(["free", "pro", "enterprise"]).parse(body.plan) as PlanId;
      await updateUserProfile(user.id, { plan });
      const refreshed = await getSessionUser();
      return NextResponse.json(userToWorkspace(refreshed!));
    }
    if (body.action === "set-channels") {
      const ch = body.channels ?? {};
      await updateUserProfile(user.id, {
        emailMode: ch.email?.mode,
        smtpJson: ch.email?.smtp ? JSON.stringify(ch.email.smtp) : undefined,
        whatsappMode:
          ch.whatsapp?.mode === "wa_me" ? "wa_me" : "cloud_api",
        whatsappToken: ch.whatsapp?.businessToken ?? undefined,
        whatsappPhoneId: ch.whatsapp?.phoneNumberId ?? undefined,
        ownerPhone: ch.whatsapp?.ownerPhone ?? user.ownerPhone ?? undefined,
        linkedinEnabled: !!ch.linkedin?.enabled,
        ownerLinkedIn:
          ch.linkedin?.ownerProfileUrl ?? user.ownerLinkedIn ?? undefined,
      });
      const refreshed = await getSessionUser();
      return NextResponse.json(userToWorkspace(refreshed!).channels);
    }
    if (body.action === "set-profile") {
      const schema = z.object({
        ownerName: z.string().min(1),
        ownerPhone: z.string().optional(),
        ownerLinkedIn: z.string().optional(),
        sendTimeDefaults: z
          .object({
            ami: z.string(),
            famille: z.string(),
            travail: z.string(),
          })
          .optional(),
      });
      const parsed = schema.parse(body);
      await updateUserProfile(user.id, {
        name: parsed.ownerName,
        ownerPhone: parsed.ownerPhone,
        ownerLinkedIn: parsed.ownerLinkedIn,
        sendTimeAmi: parsed.sendTimeDefaults?.ami,
        sendTimeFamille: parsed.sendTimeDefaults?.famille,
        sendTimeTravail: parsed.sendTimeDefaults?.travail,
      });
      const refreshed = await getSessionUser();
      return NextResponse.json(userToWorkspace(refreshed!));
    }
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
