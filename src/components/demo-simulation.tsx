"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { en } from "@/lib/i18n/en";

type Step = {
  at: string;
  channel: "Email" | "WhatsApp" | "Discord" | "LinkedIn";
  person: string;
  occasion: string;
  status: "queued" | "sending" | "sent";
  note: string;
};

const SCRIPT: Omit<Step, "status">[] = [
  {
    at: "09:00",
    channel: "WhatsApp",
    person: "Sophie Martin",
    occasion: "Birthday",
    note: "Warm note leaves quietly in the background",
  },
  {
    at: "09:02",
    channel: "Email",
    person: "Sophie Martin",
    occasion: "Birthday",
    note: "Longer birthday email follows on Gmail",
  },
  {
    at: "10:30",
    channel: "LinkedIn",
    person: "Marc Lefevre",
    occasion: "New role",
    note: "Draft ready to post. One paste, done",
  },
  {
    at: "12:00",
    channel: "Discord",
    person: "Team circle",
    occasion: "Holiday wish",
    note: "Seasonal greeting lands where they already hang out",
  },
  {
    at: "18:00",
    channel: "Email",
    person: "Claire Dupont",
    occasion: "Six month check in",
    note: "Stay close to people who already said yes",
  },
];

export function DemoSimulation() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function run() {
    setBusy(true);
    setDone(false);
    setSteps(
      SCRIPT.map((s) => ({
        ...s,
        status: "queued" as const,
      }))
    );

    for (let i = 0; i < SCRIPT.length; i++) {
      await wait(700);
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "sending" } : s
        )
      );
      await wait(900);
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "sent" } : s))
      );
    }
    setBusy(false);
    setDone(true);
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">{en.demo.title}</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--muted-foreground)]">
            {en.demo.support}
          </p>
        </div>
        <Button
          onClick={() => void run()}
          disabled={busy}
          className="bg-[var(--ink)] text-white hover:bg-[#1a2820]"
        >
          {busy ? en.demo.running : done ? en.demo.reset : en.demo.run}
        </Button>
      </div>

      {steps.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">
          Press run to walk a sales prospect through birthdays, holidays and
          check ins across Email, WhatsApp, Discord and LinkedIn.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {steps.map((s) => (
            <li
              key={`${s.at}-${s.channel}-${s.person}`}
              className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">
                  {s.at} · {s.channel} · {s.person}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {s.occasion} · {s.note}
                </p>
              </div>
              <StatusPill status={s.status} />
            </li>
          ))}
        </ul>
      )}
      {done && (
        <p className="mt-4 text-sm text-[var(--accent-strong)]">
          {en.demo.done}. On the real day, the same flow can leave in the
          background while you stay on your screen.
        </p>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: Step["status"] }) {
  const label =
    status === "queued" ? "Queued" : status === "sending" ? "Sending" : "Sent";
  const cls =
    status === "sent"
      ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
      : status === "sending"
        ? "bg-[var(--secondary)] text-[var(--foreground)]"
        : "bg-[var(--secondary)] text-[var(--muted-foreground)]";
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
