import { NextResponse } from "next/server";
import { getStore, listSequences, upsertSequence } from "@/lib/store";
import { PLAN_LIMITS } from "@/lib/types";
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
  return NextResponse.json(await listSequences());
}

export async function POST(req: Request) {
  const store = await getStore();
  if (!store.workspace) {
    return NextResponse.json({ error: "Créez d’abord un espace" }, { status: 400 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const limit = PLAN_LIMITS[store.workspace.plan].sequences;
  if (!parsed.data.id && store.sequences.length >= limit) {
    return NextResponse.json(
      { error: `Limite de séquences atteinte (${limit}). Passez en Pro.` },
      { status: 403 }
    );
  }
  const sequence = await upsertSequence(parsed.data);
  return NextResponse.json(sequence);
}
