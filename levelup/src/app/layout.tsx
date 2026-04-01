import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LevelUp - Your Personal Growth RPG",
  description:
    "A gamified self-improvement app that treats your real life like an RPG. Earn XP, level up, and become the hero of your own story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
