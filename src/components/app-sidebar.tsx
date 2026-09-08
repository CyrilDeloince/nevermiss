"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  ContactRound,
  LayoutDashboard,
  MessageSquareText,
  Radio,
  Settings2,
  Shield,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserProp = {
  name: string;
  email: string;
  plan: string;
  role: string;
};

const links = [
  { href: "/app", label: "Vue d’ensemble", icon: LayoutDashboard },
  { href: "/app/contacts", label: "Contacts", icon: ContactRound },
  { href: "/app/templates", label: "Modèles", icon: MessageSquareText },
  { href: "/app/sequences", label: "Séquences", icon: Sparkles },
  { href: "/app/messages", label: "File d’envoi", icon: CalendarClock },
  { href: "/app/channels", label: "Canaux", icon: Radio },
  { href: "/app/settings", label: "Plan & réglages", icon: Settings2 },
];

export function AppSidebar({ user }: { user: UserProp }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col border-b border-white/10 bg-[var(--ink)] text-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="font-display text-xl font-semibold">
          NeverMiss
        </Link>
        <Link
          href="/"
          className="text-xs text-white/50 hover:text-white md:hidden"
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
                  ? "bg-[var(--accent-strong)] text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
        {user.role === "admin" && (
          <Link
            href="/app/admin"
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
              pathname.startsWith("/app/admin")
                ? "bg-[var(--accent-strong)] text-white"
                : "text-white/70 hover:bg-white/5"
            )}
          >
            <Shield className="size-4" />
            Admin
          </Link>
        )}
      </nav>
      <div className="mt-auto space-y-3 px-5 pb-6">
        <div className="hidden text-xs leading-relaxed text-white/45 md:block">
          <p className="font-medium text-white/70">{user.name}</p>
          <p>{user.email}</p>
          <p className="mt-1 uppercase tracking-wide">{user.plan}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex items-center gap-2 text-xs text-white/55 hover:text-white"
        >
          <LogOut className="size-3.5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
