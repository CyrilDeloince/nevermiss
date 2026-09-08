import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/db/auth";
import { deleteContact, listContacts, upsertContact } from "@/lib/db/repo";
import type { Channel, RelationType } from "@/lib/types";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  return NextResponse.json(await listContacts(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
    const body = await req.json();
    const schema = z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),
      linkedinUrl: z.string().optional(),
      company: z.string().optional(),
      birthday: z.string().optional(),
      notes: z.string().optional(),
      relationType: z.enum(["ami", "famille", "travail"]).default("ami"),
      sendTime: z.string().optional(),
      preferredChannels: z
        .array(z.enum(["email", "whatsapp", "linkedin"]))
        .default(["email"]),
    });
    const parsed = schema.parse(body);
    const id = await upsertContact(user.id, user.plan, {
      id: parsed.id,
      name: parsed.name.trim(),
      email: parsed.email?.trim() || undefined,
      phone: parsed.phone?.trim() || undefined,
      linkedinUrl: parsed.linkedinUrl?.trim() || undefined,
      company: parsed.company?.trim() || undefined,
      birthday: parsed.birthday || undefined,
      notes: parsed.notes?.trim() || undefined,
      relationType: parsed.relationType as RelationType,
      sendTime: parsed.sendTime || undefined,
      preferredChannels: parsed.preferredChannels as Channel[],
    });
    const contacts = await listContacts(user.id);
    return NextResponse.json(contacts.find((c) => c.id === id) ?? { id });
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
  await deleteContact(user.id, id);
  return NextResponse.json({ ok: true });
}
