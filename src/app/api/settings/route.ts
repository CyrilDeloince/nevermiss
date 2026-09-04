import { NextResponse } from "next/server";
import {
  getStore,
  updateChannels,
  updatePlan,
  updateProfile,
} from "@/lib/store";
import { DEFAULT_SEND_TIMES } from "@/lib/types";
import { z } from "zod";

export async function GET() {
  const store = await getStore();
  return NextResponse.json({
    workspace: store.workspace,
    activity: store.activity,
    defaults: DEFAULT_SEND_TIMES,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    if (body.action === "set-plan") {
      const plan = z.enum(["free", "pro", "enterprise"]).parse(body.plan);
      const workspace = await updatePlan(plan);
      return NextResponse.json(workspace);
    }
    if (body.action === "set-channels") {
      const store = await getStore();
      if (!store.workspace) {
        return NextResponse.json({ error: "Aucun espace" }, { status: 400 });
      }
      const channels = await updateChannels(body.channels);
      return NextResponse.json(channels);
    }
    if (body.action === "set-profile") {
      const schema = z.object({
        ownerName: z.string().min(1),
        ownerEmail: z.string().email(),
        ownerPhone: z.string().optional(),
        ownerLinkedIn: z.string().optional(),
        sendTimeDefaults: z
          .object({
            ami: z.string(),
            famille: z.string(),
            travail: z.string(),
          })
          .optional(),
      });
      const parsed = schema.parse(body);
      const workspace = await updateProfile(parsed);
      return NextResponse.json(workspace);
    }
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
