import { NextResponse } from "next/server";
import { processDueAllUsers } from "@/lib/scheduler";

/**
 * Cron cloud : programme + envoie en arrière-plan (PC éteint OK).
 * Header Authorization: Bearer <CRON_SECRET> si défini.
 */
export const runtime = "nodejs";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await processDueAllUsers();
  return NextResponse.json({
    ok: true,
    ...result,
    at: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  return GET(req);
}
