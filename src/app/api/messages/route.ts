import { NextResponse } from "next/server";
import { listMessages } from "@/lib/store";
import {
  processDueMessages,
  scheduleOneOff,
  scheduleUpcoming,
  sendNow,
} from "@/lib/scheduler";
import { z } from "zod";

export async function GET() {
  return NextResponse.json(await listMessages());
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    if (body.action === "schedule-upcoming") {
      const result = await scheduleUpcoming();
      return NextResponse.json(result);
    }
    if (body.action === "process-due") {
      const result = await processDueMessages();
      return NextResponse.json(result);
    }
    if (body.action === "send-now") {
      const schema = z.object({
        contactId: z.string(),
        channel: z.enum(["email", "whatsapp", "linkedin"]),
        body: z.string().optional(),
        subject: z.string().optional(),
      });
      const parsed = schema.parse(body);
      const result = await sendNow(parsed);
      return NextResponse.json(result);
    }
    if (body.action === "one-off") {
      const schema = z.object({
        contactId: z.string(),
        templateId: z.string(),
        scheduledAt: z.string(),
        bodyOverride: z.string().optional(),
      });
      const parsed = schema.parse(body);
      const message = await scheduleOneOff(parsed);
      return NextResponse.json(message);
    }
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
