import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/db/auth";
import {
  deleteTemplate,
  listTemplates,
  upsertTemplate,
} from "@/lib/db/repo";
import type { Channel, Occasion } from "@/lib/types";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  return NextResponse.json(await listTemplates(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
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
      channel: z.enum(["email", "whatsapp", "linkedin"]),
      subject: z.string().optional(),
      body: z.string().min(1),
    });
    const parsed = schema.parse(await req.json());
    const id = await upsertTemplate(user.id, {
      id: parsed.id,
      name: parsed.name.trim(),
      occasion: parsed.occasion as Occasion,
      channel: parsed.channel as Channel,
      subject: parsed.subject?.trim() || undefined,
      body: parsed.body,
    });
    const all = await listTemplates(user.id);
    return NextResponse.json(all.find((t) => t.id === id));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  await deleteTemplate(user.id, id);
  return NextResponse.json({ ok: true });
}
