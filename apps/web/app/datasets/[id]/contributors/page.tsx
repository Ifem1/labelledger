"use client";

import { use, useMemo } from "react";
import { downloadJson } from "@/lib/canonical";
import { useLocalWorkspace } from "@/lib/workbench-store";

export default function ContributorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const datasetId = Number(id); const workspace = useLocalWorkspace(datasetId);
  const rows = useMemo(() => Object.entries(workspace.contributors.reduce<Record<string, { count: number; labels: Record<string, number>; latest: string }>>((acc, event) => {
    const row = acc[event.actor] ?? { count: 0, labels: {}, latest: "" }; row.count += 1; row.labels[event.label] = (row.labels[event.label] ?? 0) + 1; row.latest = event.at; acc[event.actor] = row; return acc;
  }, {})), [workspace.contributors]);
  return <div className="page"><header className="page-header"><div><div className="eyebrow">DATASET {datasetId} / BROWSER-LOCAL ACTIVITY</div><h1>Contributor activity</h1><p>This is a compact local work ledger, not an on-chain reputation score. Clearing browser storage clears these counters.</p></div><button className="quiet-button" onClick={() => downloadJson(`labelledger-contributors-${datasetId}.json`, workspace.contributors)}>EXPORT LOCAL LOG</button></header>
    <div className="ledger-grid"><section><div className="section-head"><span>CONTRIBUTOR LEDGER</span><span>NO REPUTATION SCORE</span></div><table className="sheet-table"><thead><tr><th>Wallet / alias</th><th>Local labels</th><th>Label mix</th><th>Latest</th></tr></thead><tbody>{rows.map(([actor, row]) => <tr key={actor}><td className="mono">{actor}</td><td className="numeric">{row.count}</td><td className="mono">{Object.entries(row.labels).map(([label, count]) => `${label}:${count}`).join(" · ")}</td><td>{row.latest}</td></tr>)}</tbody></table>{!rows.length && workspace.ready && <div className="empty-state">No local annotation events recorded in this browser.</div>}</section>
    <aside><div className="section-head"><span>WORK PLANE TOTALS</span><span>LOCAL ONLY</span></div><div className="section-body form-stack"><div><div className="eyebrow">ANNOTATION EVENTS</div><div className="big-number">{workspace.contributors.length}</div></div><div><div className="eyebrow">SAMPLES IN WORKSPACE</div><div className="big-number">{workspace.samples.length}</div></div><div><div className="eyebrow">DISAGREEMENTS</div><div className="big-number">{workspace.disagreements.length}</div></div><div className="notice warning">These figures are deliberately not used to authorize a GenLayer resolution.</div></div></aside></div>
  </div>;
}
