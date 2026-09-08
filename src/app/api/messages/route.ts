import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { getSessionUser } from "@/lib/db/auth";
import { getDb } from "@/lib/db/client";
import { messages } from "@/lib/db/schema";
import { listMessages } from "@/lib/db/repo";
import {
  processDueForUser,
  scheduleOneOff,
  scheduleUpcomingForUser,
  sendNowForUser,
} from "@/lib/scheduler";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  return NextResponse.json(await listMessages(user.id));
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const body = await req.json();
  try {
    if (body.action === "schedule-upcoming") {
      return NextResponse.json(await scheduleUpcomingForUser(user.id));
    }
    if (body.action === "process-due") {
      return NextResponse.json(await processDueForUser(user.id));
    }
    if (body.action === "send-now") {
      const parsed = z
        .object({
          contactId: z.string(),
          channel: z.enum(["email", "whatsapp", "linkedin"]),
          body: z.string().optional(),
          subject: z.string().optional(),
        })
        .parse(body);
      return NextResponse.json(await sendNowForUser(user, parsed));
    }
    if (body.action === "one-off") {
      const parsed = z
        .object({
          contactId: z.string(),
          templateId: z.string(),
          scheduledAt: z.string(),
          bodyOverride: z.string().optional(),
        })
        .parse(body);
      return NextResponse.json(await scheduleOneOff(user, parsed));
    }
    if (body.action === "clear-non-scheduled") {
      const db = getDb();
      await db
        .delete(messages)
        .where(
          and(
            eq(messages.userId, user.id),
            inArray(messages.status, ["sent", "failed", "ready", "skipped"])
          )
        );
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
