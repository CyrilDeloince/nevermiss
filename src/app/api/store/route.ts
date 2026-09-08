import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/db/auth";
import {
  listActivity,
  listContacts,
  listMessages,
  listSequences,
  listTemplates,
  userToWorkspace,
} from "@/lib/db/repo";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({
      workspace: null,
      contacts: [],
      templates: [],
      sequences: [],
      messages: [],
      activity: [],
      authenticated: false,
    });
  }
  return NextResponse.json({
    workspace: userToWorkspace(user),
    contacts: await listContacts(user.id),
    templates: await listTemplates(user.id),
    sequences: await listSequences(user.id),
    messages: await listMessages(user.id),
    activity: await listActivity(user.id),
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      role: user.role,
    },
  });
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Créez un compte via /login — les espaces JSON ne sont plus utilisés.",
    },
    { status: 410 }
  );
}
