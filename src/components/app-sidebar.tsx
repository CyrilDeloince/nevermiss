"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  ContactRound,
  LayoutDashboard,
  MessageSquareText,
  Radio,
  Settings2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Vue d’ensemble", icon: LayoutDashboard },
  { href: "/app/contacts", label: "Contacts", icon: ContactRound },
  { href: "/app/templates", label: "Modèles", icon: MessageSquareText },
  { href: "/app/sequences", label: "Séquences", icon: Sparkles },
  { href: "/app/messages", label: "File d’envoi", icon: CalendarClock },
  { href: "/app/channels", label: "Canaux", icon: Radio },
  { href: "/app/settings", label: "Plan & réglages", icon: Settings2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col border-b border-[#24332c] bg-[#0e1512] text-[#e8fff4] md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="font-display text-xl font-semibold">
          NeverMiss
        </Link>
        <Link
          href="/"
          className="text-xs text-[#a8b5ad] hover:text-white md:hidden"
        >
          Site
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-6">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/app" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-[#7cffb2] text-[#0e1512]"
                  : "text-[#c8d9d0] hover:bg-white/5"
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden px-5 pb-6 text-xs leading-relaxed text-[#a8b5ad] md:block">
        Cron cloud : même PC éteint, les vœux partent.
      </div>
    </aside>
  );
}
