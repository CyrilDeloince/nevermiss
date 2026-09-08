import { NextResponse } from "next/server";
import {
  createUser,
  loginUser,
  logoutCurrent,
  setSessionCookie,
  getSessionUser,
  ensureSeedUsers,
} from "@/lib/db/auth";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET() {
  await ensureSeedUsers();
  const user = await getSessionUser();
  return NextResponse.json({
    user,
    demo: {
      admin: { email: "admin@nevermiss.app", password: "nevermiss2026" },
      sales: { email: "demo@nevermiss.app", password: "demo2026" },
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    if (body.action === "signup") {
      const parsed = z
        .object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(1),
        })
        .parse(body);
      const user = await createUser(parsed);
      const { token } = await loginUser(parsed.email, parsed.password);
      await setSessionCookie(token);
      return NextResponse.json({ user });
    }
    if (body.action === "login") {
      const parsed = z
        .object({
          email: z.string().email(),
          password: z.string().min(1),
        })
        .parse(body);
      const { user, token } = await loginUser(parsed.email, parsed.password);
      await setSessionCookie(token);
      return NextResponse.json({ user });
    }
    if (body.action === "logout") {
      await logoutCurrent();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
