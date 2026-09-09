import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { HelpChatbot } from "@/components/help-chatbot";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tend — The art of caring for those who gave you their trust",
  description:
    "Tend helps you delight the clients you already have. Birthdays, holidays, warm follow ups across email, WhatsApp, Discord and LinkedIn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${bricolage.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <HelpChatbot />
      </body>
    </html>
  );
}
