import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q) return NextResponse.json([]);

  const store = await getStore();
  const hits: {
    type: "contact" | "template" | "message" | "page";
    title: string;
    subtitle?: string;
    href: string;
  }[] = [];

  for (const c of store.contacts) {
    const blob = [
      c.name,
      c.email,
      c.phone,
      c.company,
      c.notes,
      c.relationType,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (blob.includes(q) || q.split(/\s+/).every((t) => blob.includes(t))) {
      hits.push({
        type: "contact",
        title: c.name,
        subtitle: [c.relationType, c.birthday, c.phone || c.email]
          .filter(Boolean)
          .join(" · "),
        href: "/app/contacts",
      });
    }
  }

  for (const t of store.templates) {
    const blob = `${t.name} ${t.body} ${t.channel} ${t.occasion}`.toLowerCase();
    if (blob.includes(q)) {
      hits.push({
        type: "template",
        title: t.name,
        subtitle: `${t.channel} · ${t.occasion}`,
        href: "/app/templates",
      });
    }
  }

  for (const m of store.messages.slice(0, 50)) {
    const blob = `${m.body} ${m.channel} ${m.status} ${m.subject ?? ""}`.toLowerCase();
    if (blob.includes(q)) {
      hits.push({
        type: "message",
        title: `${m.channel} · ${m.status}`,
        subtitle: m.body.slice(0, 60),
        href: "/app/messages",
      });
    }
  }

  return NextResponse.json(hits.slice(0, 10));
}
