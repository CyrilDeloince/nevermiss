"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send } from "lucide-react";
import { answerHelpQuestion } from "@/lib/help-knowledge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Msg = { role: "user" | "assistant"; text: string; links?: { label: string; href: string }[] };

const SUGGESTIONS = [
  "Envoyer un anniversaire WhatsApp",
  "Changer les horaires ami / travail",
  "Ajouter un contact",
  "Déployer sur GitHub / Vercel",
];

export function HelpChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Salut ! Je suis l’assistant NeverMiss. Dis-moi ce que tu veux faire — je te guide vers la bonne page.",
      links: [
        { label: "File d’envoi", href: "/app/messages" },
        { label: "Contacts", href: "/app/contacts" },
      ],
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    const reply = answerHelpQuestion(q);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "assistant", text: reply.answer, links: reply.links },
    ]);
    setInput("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-[#0e1512] text-[#7cffb2] shadow-lg hover:bg-[#1a2822] md:right-6 md:bottom-6"
        aria-label="Ouvrir l’assistant IA"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {open && (
        <div className="fixed right-4 bottom-20 z-50 flex h-[min(520px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#d5e0da] bg-white shadow-2xl md:right-6 md:bottom-24">
          <div className="bg-[#0e1512] px-4 py-3 text-[#e8fff4]">
            <p className="font-display font-semibold">Assistant NeverMiss</p>
            <p className="text-xs text-[#a8b5ad]">
              Guide-toi dans l’app — WhatsApp, Gmail, horaires, déploiement…
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-8 bg-[#0e1512] text-[#e8fff4]"
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
                        className="rounded-md bg-[#7cffb2] px-2 py-1 text-xs font-medium text-[#0e1512]"
                        onClick={() => setOpen(false)}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex flex-wrap gap-1 border-t border-[#e8efeb] px-3 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-full bg-[#e8efeb] px-2 py-1 text-[11px] text-[#0e1512] hover:bg-[#7cffb2]/40"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="flex gap-2 border-t border-[#e8efeb] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex : envoyer WhatsApp à Guillaume…"
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
              className="self-end bg-[#0e1512] text-[#7cffb2]"
              aria-label="Envoyer"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
