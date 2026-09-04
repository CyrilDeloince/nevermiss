import { NextResponse } from "next/server";
import { createWorkspace, getStore, resetStore } from "@/lib/store";

export async function GET() {
  const store = await getStore();
  return NextResponse.json(store);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (body.action === "reset") {
    const store = await resetStore();
    return NextResponse.json(store);
  }
  if (body.action === "bootstrap") {
    const workspace = await createWorkspace({
      email: body.email ?? "demo@nevermiss.app",
      name: body.name ?? "Alex Martin",
    });
    const store = await getStore();
    return NextResponse.json({ workspace, store });
  }
  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
