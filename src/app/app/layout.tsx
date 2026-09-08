import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/db/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteSearch } from "@/components/site-search";

export const runtime = "nodejs";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--fog)] md:flex-row">
      <AppSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--fog)]/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
            <SiteSearch className="flex-1" />
            <p className="hidden text-xs text-[var(--muted-foreground)] lg:block">
              {user.name} · {user.plan}
            </p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
