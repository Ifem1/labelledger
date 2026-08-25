"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DATA_MODE, EXPECTED_CHAIN_ID, hasContract } from "@/lib/genlayer/config";
import { useWallet } from "./wallet-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const pathname = usePathname();
  const match = pathname.match(/\/datasets\/(\d+)/);
  const caseMatch = pathname.match(/\/cases\/(\d+)/);
  const datasetId = match?.[1] ?? (caseMatch ? "1" : "");
  const nav = datasetId ? [
    ["ANNOTATE", `/datasets/${datasetId}/annotate`],
    ["DISAGREEMENTS", `/datasets/${datasetId}/disagreements`],
    ["RUBRIC", `/datasets/${datasetId}/rubric`],
    ["EPOCHS", `/datasets/${datasetId}/epochs`],
    ["CONTRIBUTORS", `/datasets/${datasetId}/contributors`],
    ["EXPORT", `/datasets/${datasetId}/export`],
  ] : [];

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="brand-block">
          <Link href="/" className="brand">LABELLEDGER</Link>
          <span className="brand-sub">PRECEDENT-AWARE LABEL SETTLEMENT</span>
        </div>
        <div className="provenance">
          <span className={`status-dot ${DATA_MODE === "live" ? "status-live" : "status-fixture"}`} />
          <span>{DATA_MODE.toUpperCase()}</span>
          <span className="rule" />
          <span>STUDIONET / {EXPECTED_CHAIN_ID}</span>
          {DATA_MODE === "live" && !hasContract && <span className="warning-text">CONTRACT UNSET</span>}
        </div>
        <div className="wallet-utility">
          {wallet.connected ? (
            <>
              <span className={wallet.correctNetwork ? "network-ok" : "network-bad"}>{wallet.chainId || "NO CHAIN"}</span>
              <span className="mono">{wallet.address.slice(0, 7)}…{wallet.address.slice(-5)}</span>
              {!wallet.correctNetwork && <button className="utility-button" onClick={() => void wallet.switchNetwork()}>SWITCH</button>}
            </>
          ) : <button className="utility-button" disabled={wallet.connecting} onClick={() => void wallet.connect()}>{wallet.connecting ? "CONNECTING" : "CONNECT WALLET"}</button>}
        </div>
      </header>
      {nav.length > 0 && (
        <nav className="domain-nav" aria-label="Dataset sections">
          <Link href="/">← DATASETS</Link>
          {nav.map(([label, href]) => <Link key={href} className={pathname === href ? "active" : ""} href={href}>{label}</Link>)}
        </nav>
      )}
      {wallet.error && <div className="global-error"><span>{wallet.error}</span><button onClick={wallet.clearError}>DISMISS</button></div>}
      <main>{children}</main>
    </div>
  );
}
