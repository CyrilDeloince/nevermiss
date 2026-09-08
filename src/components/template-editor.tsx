"use client";

import { useRef } from "react";
import { TEMPLATE_VARS, tokenFor } from "@/lib/template-vars";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  id?: string;
};

/** Éditeur de message : pastilles Prénom / Nom — jamais de {{}} à taper */
export function TemplateEditor({
  value,
  onChange,
  rows = 6,
  placeholder,
  className,
  id,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insertVar(key: string) {
    const el = ref.current;
    const token = tokenFor(key);
    if (!el) {
      onChange(value + token);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + token + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_VARS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => insertVar(v.key)}
            className="rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent-strong)] hover:bg-white"
          >
            + {v.label}
          </button>
        ))}
      </div>
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm leading-relaxed text-[var(--foreground)] outline-none focus:border-[var(--accent-strong)] focus:ring-2 focus:ring-[var(--ring)]"
      />
      <p className="text-xs text-[var(--muted-foreground)]">
        Cliquez une pastille pour inserer le prenom, le nom… automatiquement.
      </p>
    </div>
  );
}
