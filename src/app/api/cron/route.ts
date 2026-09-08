import { NextResponse } from "next/server";
import { processDueAllUsers } from "@/lib/scheduler";

/**
 * Cron cloud : programme + envoie en arrière-plan (PC éteint OK).
 * Auth : Authorization Bearer CRON_SECRET, ou header x-vercel-cron.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  // Vercel Cron natif
  if (req.headers.get("x-vercel-cron") === "1") return true;
  return false;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processDueAllUsers();
  return NextResponse.json({
    ok: true,
    ...result,
    tz: process.env.SCHEDULE_TZ || "Europe/Paris",
    at: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  return GET(req);
}
