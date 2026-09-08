import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/db/auth";
import { listSequences, upsertSequence } from "@/lib/db/repo";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  occasion: z.enum([
    "birthday",
    "christmas",
    "newyear",
    "promotion",
    "custom",
  ]),
  active: z.boolean(),
  steps: z.array(
    z.object({
      id: z.string(),
      dayOffset: z.number(),
      templateId: z.string(),
      channel: z.enum(["email", "whatsapp", "linkedin"]),
    })
  ),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  return NextResponse.json(await listSequences(user.id));
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const id = await upsertSequence(user.id, user.plan, parsed.data);
    const all = await listSequences(user.id);
    return NextResponse.json(all.find((s) => s.id === id));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
