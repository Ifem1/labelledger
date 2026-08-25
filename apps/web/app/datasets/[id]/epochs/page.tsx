"use client";

import { use, useMemo } from "react";
import { TxRail } from "@/components/tx-rail";
import { useWallet } from "@/components/wallet-provider";
import { canonicalJson, downloadJson, sha256Text } from "@/lib/canonical";
import { DATA_MODE } from "@/lib/genlayer/config";
import { useCases, useDataset, useEpochs } from "@/lib/use-data";
import { useTrackedWrite } from "@/lib/use-tx";

export default function EpochsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const datasetId = Number(id);
  const dataset = useDataset(datasetId); const cases = useCases(datasetId); const wallet = useWallet(); const { tx, run } = useTrackedWrite();
  const epochs = useEpochs(datasetId, dataset.data?.epoch_count ?? 0);
  const terminal = useMemo(() => cases.data.filter((item) => ["RESOLVED", "ABSTAINED", "VOIDED"].includes(item.status)), [cases.data]);
  const groups = useMemo(() => Object.entries(terminal.reduce<Record<string, number[]>>((acc, item) => { const key = String(item.rubric_version); (acc[key] ??= []).push(item.case_id); return acc; }, {})), [terminal]);
  const canWrite = DATA_MODE === "live" && wallet.connected && wallet.correctNetwork;

  async function seal(version: string, caseIds: number[]) {
    const manifest = { dataset_id: datasetId, rubric_version: Number(version), case_ids: caseIds, generated_at: new Date().toISOString(), note: "Client-generated manifest. Chain digest is authoritative." };
    const canonical = canonicalJson(manifest); const digest = await sha256Text(canonical);
    await run("seal_epoch", [BigInt(datasetId), `sha256:${digest}`, digest, JSON.stringify(caseIds)], async () => { await dataset.reload(); await epochs.reload(); });
  }

  return <div className="page">
    <header className="page-header"><div><div className="eyebrow">DATASET {datasetId} / RELEASE MANIFESTS</div><h1>Dataset epochs</h1><p>Epochs seal terminal escalations from exactly one rubric version. The manifest is assembled client-side; only its digest and case set become chain state.</p></div><span className="mono muted">{epochs.data.length} SEALED</span></header>
    {(dataset.loading || cases.loading || epochs.loading) && <div className="loading-line" />}
    <div className="work-grid"><section className="main-work"><div className="section-head"><span>SEALED EPOCH LEDGER</span><span>APPEND ONLY</span></div>
      <table className="sheet-table"><thead><tr><th>Epoch</th><th>Rubric</th><th>Cases</th><th>Manifest digest</th><th>Sealed</th><th>Export</th></tr></thead><tbody>{epochs.data.map((epoch) => <tr key={epoch.epoch_id}><td className="mono">EP-{String(epoch.epoch_id).padStart(4, "0")}</td><td>v{epoch.rubric_version}</td><td className="mono">{epoch.case_ids.join(", ")}</td><td className="mono">{epoch.manifest_digest.slice(0, 24)}…</td><td>{epoch.sealed_at || "—"}</td><td><button className="quiet-button" onClick={() => downloadJson(`labelledger-epoch-${epoch.epoch_id}.json`, epoch)}>DOWNLOAD</button></td></tr>)}</tbody></table>
      {!epochs.data.length && !epochs.loading && <div className="empty-state">No sealed epoch is available from this data source.</div>}
    </section><aside className="side-work"><div className="section-head"><span>READY SETS</span><span>ONE RUBRIC EACH</span></div><div className="section-body form-stack">
      {groups.map(([version, ids]) => <div className="notice" key={version}><div className="eyebrow">RUBRIC v{version}</div><p>{ids.length} terminal case{ids.length === 1 ? "" : "s"}: {ids.join(", ")}</p><button className="action-button" disabled={!canWrite} onClick={() => void seal(version, ids)}>SEAL EPOCH</button></div>)}
      {!groups.length && <div className="muted">No terminal cases are ready to group.</div>}
      <div className="notice warning">A mixed-rubric case list is rejected by the contract even if the UI is bypassed.</div>
    </div></aside></div><TxRail state={tx} />
  </div>;
}
