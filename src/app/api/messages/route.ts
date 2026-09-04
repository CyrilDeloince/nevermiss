import { NextResponse } from "next/server";
import { listMessages } from "@/lib/store";
import { processDueMessages, scheduleOneOff, scheduleUpcoming } from "@/lib/scheduler";
import { z } from "zod";

export async function GET() {
  return NextResponse.json(await listMessages());
}

export async function POST(req: Request) {
  const body = await req.json();
  if (body.action === "schedule-upcoming") {
    const result = await scheduleUpcoming();
    return NextResponse.json(result);
  }
  if (body.action === "process-due") {
    const result = await processDueMessages();
    return NextResponse.json(result);
  }
  if (body.action === "one-off") {
    const schema = z.object({
      contactId: z.string(),
      templateId: z.string(),
      scheduledAt: z.string(),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const message = await scheduleOneOff(parsed.data);
    return NextResponse.json(message);
  }
  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
