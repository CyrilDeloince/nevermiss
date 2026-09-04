import { NextResponse } from "next/server";
import { getStore, updateChannels, updatePlan } from "@/lib/store";
import { z } from "zod";

export async function GET() {
  const store = await getStore();
  return NextResponse.json({
    workspace: store.workspace,
    activity: store.activity,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (body.action === "set-plan") {
    const plan = z.enum(["free", "pro", "enterprise"]).parse(body.plan);
    const workspace = await updatePlan(plan);
    return NextResponse.json(workspace);
  }
  if (body.action === "set-channels") {
    const workspace = await getStore();
    if (!workspace.workspace) {
      return NextResponse.json({ error: "Aucun espace" }, { status: 400 });
    }
    const channels = await updateChannels(body.channels);
    return NextResponse.json(channels);
  }
  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
