import { AppSidebar } from "@/components/app-sidebar";
import { SiteSearch } from "@/components/site-search";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f5] md:flex-row">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="sticky top-0 z-40 border-b border-[#d5e0da] bg-[#f4f7f5]/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
            <SiteSearch className="flex-1" />
            <p className="hidden text-xs text-[#5a6b63] lg:block">
              Cherche un contact, WhatsApp, horaires…
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
