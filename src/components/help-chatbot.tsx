"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";
import {
  answerGuideQuestion,
  runGuideAction,
  type GuideAction,
  type GuideContact,
  type GuideLink,
} from "@/lib/guide-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Msg = {
  role: "user" | "assistant";
  text: string;
  links?: GuideLink[];
  actions?: GuideAction[];
};

const SUGGESTIONS = [
  "Send WhatsApp to Sophie",
  "Schedule upcoming for me",
  "Add a contact",
];

export function HelpChatbot() {
  const pathname = usePathname();
  const router = useRouter();
  const onApp = pathname.startsWith("/app");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [contacts, setContacts] = useState<GuideContact[]>([]);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi. I am the Jardin guide. Tell me what you want. I will show you how, and I can do it for you if you prefer.",
      links: [
        { label: "Send queue", href: "/app/messages" },
        { label: "Contacts", href: "/app/contacts" },
      ],
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open || !onApp) return;
    void fetch("/api/contacts")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setContacts(
            data.map((c: GuideContact & { preferredChannels?: string[] }) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              email: c.email,
              preferredChannels: c.preferredChannels as GuideContact["preferredChannels"],
            }))
          );
        }
      })
      .catch(() => undefined);
  }, [open, onApp]);

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    const reply = answerGuideQuestion(q, contacts);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      {
        role: "assistant",
        text: reply.answer,
        links: reply.links,
        actions: reply.actions,
      },
    ]);
    setInput("");
  }

  async function onAction(action: GuideAction) {
    if (action.kind === "open" && action.href) {
      setOpen(false);
      router.push(action.href);
      return;
    }
    setBusy(true);
    try {
      const text = await runGuideAction(action);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text },
      ]);
      router.refresh();
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            e instanceof Error
              ? e.message
              : "Something went wrong. You can still do it from Send queue.",
          links: [{ label: "Send queue", href: "/app/messages" }],
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!onApp) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-[var(--ink)] text-[#e6d3a4] shadow-lg hover:bg-[#1a2820] md:right-6 md:bottom-6"
        aria-label="Open Jardin guide"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {open && (
        <div className="fixed right-4 bottom-20 z-50 flex h-[min(560px,72vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xl md:right-6 md:bottom-24">
          <div className="bg-[var(--ink)] px-4 py-3 text-[#f7f4ee]">
            <p className="font-display font-semibold">Jardin guide</p>
            <p className="text-xs text-white/55">
              I explain, then I can do it for you
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-8 bg-[var(--ink)] text-[#f7f4ee]"
                    : "mr-4 bg-[#f4f7f5] text-[#0e1512]"
                }`}
              >
                {m.text}
                {m.links && m.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.links.map((l) => (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        className="rounded-md bg-[#e6d3a4] px-2 py-1 text-xs font-medium text-[#0f1a14]"
                        onClick={() => setOpen(false)}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
                {m.actions && m.actions.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {m.actions.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        disabled={busy}
                        onClick={() => void onAction(a)}
                        className="rounded-md bg-[var(--ink)] px-2.5 py-1.5 text-left text-xs font-medium text-white hover:bg-[#1a2820] disabled:opacity-50"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex flex-wrap gap-1 border-t border-[var(--border)] px-3 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-md bg-[#efeae1] px-2 py-1 text-[11px] text-[#16352b] hover:bg-[#e6d3a4]/50"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="flex gap-2 border-t border-[var(--border)] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: send WhatsApp to Sophie…"
              rows={2}
              className="min-h-0 flex-1 resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
            />
            <Button
              type="submit"
              disabled={busy}
              className="self-end bg-[var(--ink)] text-[#e6d3a4]"
              aria-label="Send"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
