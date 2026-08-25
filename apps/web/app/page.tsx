"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TxRail } from "@/components/tx-rail";
import { useWallet } from "@/components/wallet-provider";
import { DEMO_LABELS } from "@/lib/demo";
import { DATA_MODE } from "@/lib/genlayer/config";
import { useDatasets } from "@/lib/use-data";
import { useTrackedWrite } from "@/lib/use-tx";

export default function DatasetSwitchboard() {
  const datasets = useDatasets();
  const wallet = useWallet();
  const { tx, run } = useTrackedWrite();
  const [name, setName] = useState("Intent Dispute Boundary Set");
  const [url, setUrl] = useState("");
  const [digest, setDigest] = useState("");
  const [schema, setSchema] = useState(JSON.stringify(DEMO_LABELS, null, 2));
  const canWrite = DATA_MODE === "live" && wallet.connected && wallet.correctNetwork;
  const openDisagreements = useMemo(() => datasets.data.reduce((sum, item) => sum + Math.max(0, item.case_count - item.resolved_count), 0), [datasets.data]);

  async function createDataset() {
    await run("create_dataset", [name, url, digest, schema], datasets.reload);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">DATASET SWITCHBOARD / AUTHORITATIVE CONFIGURATION</div>
          <h1>Classification boundary ledger</h1>
          <p>Routine labels stay in the browser. Only disputed samples cross the boundary into versioned GenLayer settlement and precedent memory.</p>
        </div>
        <div className="mono muted">{datasets.data.length} DATASET{datasets.data.length === 1 ? "" : "S"} / {openDisagreements} OPEN OR NON-RESOLVED</div>
      </header>
      {datasets.loading && <div className="loading-line" />}
      {datasets.error && <div className="notice error" style={{ margin: 16 }}>{datasets.error}</div>}
      <div className="work-grid">
        <section className="main-work">
          <div className="section-head"><span>REGISTERED DATASETS</span><span>RUBRIC / CASES / EPOCHS</span></div>
          <div className="table-scroll">
            <table className="dataset-table">
              <thead><tr><th>ID</th><th>Dataset</th><th>Owner</th><th className="numeric">Rubric</th><th className="numeric">Cases</th><th className="numeric">Resolved</th><th className="numeric">Epochs</th><th /></tr></thead>
              <tbody>
                {datasets.data.map((dataset) => (
                  <tr className="dataset-row" key={dataset.dataset_id}>
                    <td className="mono">DS-{String(dataset.dataset_id).padStart(4, "0")}</td>
                    <td><div className="dataset-name">{dataset.name}</div><div className="eyebrow">{dataset.rubric_digest.slice(0, 20)}{dataset.rubric_digest.length > 20 ? "…" : ""}</div></td>
                    <td className="mono muted">{dataset.owner.slice(0, 10)}…</td>
                    <td className="numeric">v{dataset.rubric_version}</td>
                    <td className="numeric">{dataset.case_count}</td>
                    <td className="numeric">{dataset.resolved_count}</td>
                    <td className="numeric">{dataset.epoch_count}</td>
                    <td><Link className="action-button" href={`/datasets/${dataset.dataset_id}/annotate`}>OPEN</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!datasets.loading && datasets.data.length === 0 && <div className="empty-state">No authoritative datasets are readable from the configured source.</div>}
        </section>
        <aside className="side-work">
          <div className="section-head"><span>REGISTER DATASET</span><span>OWNER WRITE</span></div>
          <div className="section-body form-stack">
            <div className="notice warning">Publishing creates rubric version 1. The URL must be public HTTPS and the digest must be SHA-256 hex. No server uploads are performed.</div>
            <div className="field"><label>Name</label><input value={name} maxLength={96} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field"><label>Rubric URL</label><input placeholder="https://… commit-pinned or immutable public rubric" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
            <div className="field"><label>Rubric SHA-256</label><input className="mono" placeholder="64 hex characters" value={digest} onChange={(e) => setDigest(e.target.value)} /></div>
            <div className="field"><label>Label schema JSON / 3–8 labels</label><textarea rows={12} value={schema} onChange={(e) => setSchema(e.target.value)} /></div>
            <button className="action-button" disabled={!canWrite || !digest} onClick={() => void createDataset()}>PUBLISH DATASET</button>
            {!wallet.connected && <div className="muted">Connect an injected wallet to enable writes.</div>}
            {wallet.connected && !wallet.correctNetwork && <div className="danger">StudioNet chain 61999 required.</div>}
            {DATA_MODE === "fixture" && <div className="muted">Fixture mode is intentionally read/demo-only.</div>}
          </div>
        </aside>
      </div>
      <TxRail state={tx} />
    </div>
  );
}
