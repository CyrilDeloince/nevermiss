import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/db/auth";
import { adminStats } from "@/lib/db/repo";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Accès admin requis" }, { status: 403 });
  }
  return NextResponse.json(await adminStats());
}
