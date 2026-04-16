import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LILA — Tic-Tac-Toe",
  description:
    "Real-time multiplayer Tic-Tac-Toe powered by Nakama. Challenge players worldwide in a beautiful, server-authoritative game.",
  keywords: ["tic-tac-toe", "multiplayer", "nakama", "realtime", "game"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
