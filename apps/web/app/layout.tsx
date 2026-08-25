import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/wallet-provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "LabelLedger — Precedent-aware label settlement",
  description: "GenLayer settlement for ambiguous AI dataset labels with rubric-versioned precedent.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <AppShell>{children}</AppShell>
        </WalletProvider>
      </body>
    </html>
  );
}
