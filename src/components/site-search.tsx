"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { HELP_CATALOG, searchHelp, type HelpEntry } from "@/lib/help-knowledge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LiveHit = {
  type: "contact" | "template" | "message" | "page";
  title: string;
  subtitle?: string;
  href: string;
};

export function SiteSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState<LiveHit[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  const pages = useMemo(() => searchHelp(q, 6), [q]);

  useEffect(() => {
    if (!q.trim()) {
      setLive([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) setLive(await res.json());
      } catch {
        setLive([]);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        boxRef.current?.querySelector("input")?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function go(href: string) {
    setOpen(false);
    setQ("");
    router.push(href);
  }

  const show = open && (q.trim().length > 0 || true);
  const emptyQueryPages = HELP_CATALOG.slice(0, 5);

  return (
    <div ref={boxRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5a6b63]" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher… (contacts, WhatsApp, horaires)"
          className="h-10 border-[#d5e0da] bg-white pl-9 pr-14 text-sm"
          aria-label="Rechercher dans NeverMiss"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-[#d5e0da] bg-[#f4f7f5] px-1.5 py-0.5 text-[10px] text-[#5a6b63] sm:inline">
          ⌘K
        </kbd>
      </div>

      {show && open && (
        <div className="absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-[#d5e0da] bg-white shadow-xl">
          {live.length > 0 && (
            <div className="border-b border-[#e8efeb] p-2">
              <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-[#5a6b63]">
                Dans vos données
              </p>
              {live.map((hit, i) => (
                <button
                  key={`${hit.type}-${hit.title}-${i}`}
                  type="button"
                  onClick={() => go(hit.href)}
                  className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-[#f4f7f5]"
                >
                  <span className="text-sm font-medium text-[#0e1512]">
                    {hit.title}
                  </span>
                  <span className="text-xs text-[#5a6b63]">
                    {hit.type}
                    {hit.subtitle ? ` · ${hit.subtitle}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className="p-2">
            <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-[#5a6b63]">
              Pages & aide
            </p>
            {(q.trim() ? pages : emptyQueryPages).map((entry: HelpEntry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => go(entry.href)}
                className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-[#f4f7f5]"
              >
                <span className="text-sm font-medium text-[#0e1512]">
                  {entry.title}
                </span>
                <span className="line-clamp-1 text-xs text-[#5a6b63]">
                  {entry.description}
                </span>
              </button>
            ))}
            {q.trim() && pages.length === 0 && live.length === 0 && (
              <p className="px-3 py-4 text-sm text-[#5a6b63]">
                Aucun résultat. Demande au chatbot à droite →
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
