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
  title: "NeverMiss — Ne ratez plus jamais une relation",
  description:
    "SaaS qui envoie automatiquement vos vœux d’anniversaire, Noël et relances LinkedIn. Email dès aujourd’hui. Free, Pro 20€/mois, Enterprise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${figtree.variable} ${bricolage.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <HelpChatbot />
      </body>
    </html>
  );
}
