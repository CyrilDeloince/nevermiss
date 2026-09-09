"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { DemoSimulation } from "@/components/demo-simulation";
import type { AppStore } from "@/lib/types";
import { PLAN_LIMITS } from "@/lib/types";
import { formatFrDate } from "@/lib/messages-client";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";

type StorePayload = AppStore & {
  authenticated?: boolean;
  user?: { name: string; email: string; plan: string; role: string };
};

export default function AppHomePage() {
  const [store, setStore] = useState<StorePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/store");
    const data = (await res.json()) as StorePayload;
    setStore(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function runScheduler() {
    setBusy(true);
    setFlash(null);
    const schedule = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "schedule-upcoming" }),
    }).then((r) => r.json());
    const process = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "process-due" }),
    }).then((r) => r.json());
    await refresh();
    setBusy(false);
    setFlash(
      `Scheduled: ${schedule.created ?? 0} · Processed: ${process.processed ?? 0}`
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">{en.app.loading}</p>
    );
  }

  const plan = store?.workspace?.plan ?? "free";
  const limits = PLAN_LIMITS[plan];
  const upcoming = (store?.messages ?? [])
    .filter((m) => m.status === "scheduled" || m.status === "ready")
    .slice(0, 5);
  const activity = store?.activity ?? [];
  const firstName =
    store?.user?.name?.split(" ")[0] ?? store?.workspace?.ownerName;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {en.app.greeting} {firstName}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {limits.label} plan · {store?.contacts.length ?? 0}/{limits.contacts}{" "}
            contacts · your garden stays on your account
          </p>
        </div>
        <Button
          onClick={() => void runScheduler()}
          disabled={busy}
          className="bg-[var(--ink)] text-white hover:bg-[#1a2820]"
        >
          {busy ? "…" : en.app.schedule}
        </Button>
      </div>

      {flash && (
        <p className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
          {flash}
        </p>
      )}

      <DemoSimulation />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: en.app.contacts,
            value: String(store?.contacts.length ?? 0),
            href: "/app/contacts",
          },
          {
            label: "Scheduled",
            value: String(
              store?.messages.filter((m) => m.status === "scheduled").length ?? 0
            ),
            href: "/app/messages",
          },
          {
            label: "Sent",
            value: String(
              store?.messages.filter((m) => m.status === "sent").length ?? 0
            ),
            href: "/app/messages",
          },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-[var(--border)] bg-white px-5 py-4 transition hover:border-[var(--accent-strong)]/40"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              {s.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">{s.value}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{en.app.upcoming}</h2>
          <Link
            href="/app/messages"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            {en.app.seeAll}
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No messages scheduled yet. Add a contact with a birthday, then click
            Schedule & send.
          </p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {m.channel} · {m.status}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                    {m.body}
                  </p>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {formatFrDate(m.scheduledAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="mb-3 font-display text-lg font-semibold">{en.app.activity}</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Nothing yet.</p>
        ) : (
          <ul className="space-y-2">
            {activity.slice(0, 8).map((a) => (
              <li key={a.id} className="text-sm text-[var(--muted-foreground)]">
                <span className="text-[var(--foreground)]">{a.message}</span>
                <span className="ml-2 text-xs">{formatFrDate(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
        {en.app.privacyNote}{" "}
        <Link href="/app/channels" className="underline underline-offset-2">
          Configure channels
        </Link>
      </p>
    </div>
  );
}
