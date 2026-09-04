import { NextResponse } from "next/server";
import { processDueMessages, scheduleUpcoming } from "@/lib/scheduler";

/**
 * Endpoint cron : à appeler toutes les heures / tous les jours
 * depuis Vercel Cron, Railway, cron-job.org, etc.
 * Ainsi NeverMiss tourne même PC éteint.
 *
 * Securité : header Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const scheduled = await scheduleUpcoming();
  const processed = await processDueMessages();

  return NextResponse.json({
    ok: true,
    scheduled: scheduled.created,
    processed: processed.processed,
    results: processed.results,
    at: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  return GET(req);
}
