import { NextResponse } from "next/server";
import {
  deleteTemplate,
  listTemplates,
  upsertTemplate,
} from "@/lib/store";
import { z } from "zod";

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

export async function GET() {
  return NextResponse.json(await listTemplates());
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const template = await upsertTemplate(parsed.data);
  return NextResponse.json(template);
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  await deleteTemplate(id);
  return NextResponse.json({ ok: true });
}
