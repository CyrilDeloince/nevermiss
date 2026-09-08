"use client";

import { useCallback, useEffect, useState } from "react";

type AdminData = {
  users: Array<{
    id: string;
    email: string;
    name: string;
    plan: string;
    role: string;
    createdAt: string;
    contactCount: number;
    messageCount: number;
    sentCount: number;
  }>;
  totals: {
    users: number;
    contacts: number;
    messages: number;
    sent: number;
  };
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Accès refusé");
      return;
    }
    setData(json);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">Chargement admin…</p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Admin</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Vue globale des comptes — chaque utilisateur ne voit que ses propres
          données. Vos données vous appartiennent.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Comptes", data.totals.users],
          ["Contacts", data.totals.contacts],
          ["Messages", data.totals.messages],
          ["Envoyés", data.totals.sent],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-[var(--border)] bg-white px-5 py-4"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--secondary)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-medium">Compte</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Contacts</th>
              <th className="px-4 py-3 font-medium">Messages</th>
              <th className="px-4 py-3 font-medium">Envoyés</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {u.email}
                    {u.role === "admin" ? " · admin" : ""}
                  </p>
                </td>
                <td className="px-4 py-3 uppercase">{u.plan}</td>
                <td className="px-4 py-3">{u.contactCount}</td>
                <td className="px-4 py-3">{u.messageCount}</td>
                <td className="px-4 py-3">{u.sentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
