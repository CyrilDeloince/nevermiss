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
  title: "Jardin — The art of caring for those who gave you their trust",
  description:
    "Jardin helps you delight the clients you already have. Cultivate your garden. The butterflies will come.",
  icons: {
    icon: "/jardin-mark.png",
    apple: "/jardin-mark.png",
  },
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
