"use client";

import { use, useEffect, useMemo, useState } from "react";
import { TxRail } from "@/components/tx-rail";
import { useWallet } from "@/components/wallet-provider";
import { DATA_MODE } from "@/lib/genlayer/config";
import { useDataset } from "@/lib/use-data";
import { useTrackedWrite } from "@/lib/use-tx";
import type { LabelDefinition } from "@/lib/types";

export default function RubricPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const datasetId = Number(id);
  const dataset = useDataset(datasetId);
  const wallet = useWallet();
  const { tx, run } = useTrackedWrite();
  const [url, setUrl] = useState("");
  const [digest, setDigest] = useState("");
  const [schema, setSchema] = useState("");

  useEffect(() => {
    if (!dataset.data) return;
    setUrl(dataset.data.rubric_url);
    setDigest(dataset.data.rubric_digest === "fixture-not-chain-proof" ? "" : dataset.data.rubric_digest);
    try { setSchema(JSON.stringify(JSON.parse(dataset.data.label_schema_json), null, 2)); } catch { setSchema(dataset.data.label_schema_json); }
  }, [dataset.data]);

  const currentLabels = useMemo<LabelDefinition[]>(() => { try { return JSON.parse(dataset.data?.label_schema_json ?? "[]"); } catch { return []; } }, [dataset.data]);
  const draftLabels = useMemo<LabelDefinition[]>(() => { try { return JSON.parse(schema || "[]"); } catch { return []; } }, [schema]);
  const canWrite = DATA_MODE === "live" && wallet.connected && wallet.correctNetwork && Boolean(digest);

  async function publish() {
    await run("update_rubric", [BigInt(datasetId), url, digest, schema], dataset.reload);
  }

  if (dataset.loading) return <div className="page"><div className="loading-line" /></div>;
  if (dataset.error || !dataset.data) return <div className="page"><div className="notice error" style={{ margin: 16 }}>{dataset.error || "Dataset unavailable."}</div></div>;

  return <div className="page">
    <header className="page-header"><div><div className="eyebrow">DATASET {datasetId} / VERSIONED GOVERNING RULES</div><h1>Rubric editor</h1><p>Publishing creates v{dataset.data.rubric_version + 1}. Existing cases remain permanently bound to the version captured when they opened.</p></div><span className="status-tag">CURRENT v{dataset.data.rubric_version}</span></header>
    <div className="diff-grid">
      <section className="diff-pane"><div className="section-head"><span>CURRENT / v{dataset.data.rubric_version}</span><span>{currentLabels.length} LABELS</span></div><pre className="code-block">{JSON.stringify(currentLabels, null, 2)}</pre></section>
      <section className="diff-pane"><div className="section-head"><span>DRAFT / v{dataset.data.rubric_version + 1}</span><span>{draftLabels.length || "?"} LABELS</span></div><pre className="code-block">{schema}</pre></section>
    </div>
    <div className="work-grid">
      <section className="main-work"><div className="section-head"><span>LABEL BOUNDARY DIFF</span><span>IDS ARE AUTHORITY-CRITICAL</span></div><div className="section-body">
        <table className="sheet-table"><thead><tr><th>ID</th><th>Current definition</th><th>Draft definition</th></tr></thead><tbody>{Array.from(new Set([...currentLabels.map((x) => x.id), ...draftLabels.map((x) => x.id)])).map((labelId) => {
          const oldLabel = currentLabels.find((x) => x.id === labelId); const nextLabel = draftLabels.find((x) => x.id === labelId);
          return <tr key={labelId}><td className="mono">{labelId}</td><td>{oldLabel?.definition ?? <span className="muted">NOT PRESENT</span>}</td><td>{nextLabel?.definition ?? <span className="danger">REMOVED</span>}</td></tr>;
        })}</tbody></table>
      </div></section>
      <aside className="side-work"><div className="section-head"><span>PUBLISH NEW VERSION</span><span>OWNER ONLY</span></div><div className="section-body form-stack">
        <div className="field"><label>Rubric HTTPS URL</label><input value={url} onChange={(e) => setUrl(e.target.value)} /></div>
        <div className="field"><label>Rubric SHA-256</label><input className="mono" value={digest} onChange={(e) => setDigest(e.target.value)} placeholder="64 hex characters" /></div>
        <div className="field"><label>Label schema JSON</label><textarea rows={16} value={schema} onChange={(e) => setSchema(e.target.value)} /></div>
        <button className="action-button" disabled={!canWrite} onClick={() => void publish()}>PUBLISH RUBRIC v{dataset.data.rubric_version + 1}</button>
        <div className="notice warning">Updating the current dataset configuration never mutates an older case or its allowed label set.</div>
      </div></aside>
    </div>
    <TxRail state={tx} />
  </div>;
}
