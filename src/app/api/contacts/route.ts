import { NextResponse } from "next/server";
import {
  deleteContact,
  getStore,
  listContacts,
  upsertContact,
} from "@/lib/store";
import { PLAN_LIMITS } from "@/lib/types";
import { z } from "zod";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  company: z.string().optional(),
  birthday: z.string().optional(),
  notes: z.string().optional(),
  relationType: z.enum(["ami", "famille", "travail"]).default("ami"),
  sendTime: z.string().optional(),
  preferredChannels: z.array(z.enum(["email", "whatsapp", "linkedin"])),
});

export async function GET() {
  return NextResponse.json(await listContacts());
}

export async function POST(req: Request) {
  const store = await getStore();
  if (!store.workspace) {
    return NextResponse.json(
      { error: "Créez d’abord un espace" },
      { status: 400 }
    );
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const limit = PLAN_LIMITS[store.workspace.plan].contacts;
  if (!parsed.data.id && store.contacts.length >= limit) {
    return NextResponse.json(
      {
        error: `Limite ${store.workspace.plan} atteinte (${limit} contacts). Passez en Pro.`,
      },
      { status: 403 }
    );
  }
  const contact = await upsertContact({
    ...parsed.data,
    email: parsed.data.email || undefined,
    sendTime: parsed.data.sendTime || undefined,
  });
  return NextResponse.json(contact);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  await deleteContact(id);
  return NextResponse.json({ ok: true });
}
