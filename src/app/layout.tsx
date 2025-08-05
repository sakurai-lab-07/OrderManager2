import React from "react";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "学祭屋台注文システム",
  description: "担々麺注文システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-white text-black min-h-screen">{children}</body>
    </html>
  );
}
