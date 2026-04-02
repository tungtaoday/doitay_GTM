import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Cockpit — Doitay.vn",
  description: "CEO Dashboard for Agent Pipeline System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
