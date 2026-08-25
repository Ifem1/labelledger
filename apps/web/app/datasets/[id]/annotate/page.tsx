"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDataset } from "@/lib/use-data";
import { useLocalWorkspace } from "@/lib/workbench-store";
import type { LabelDefinition } from "@/lib/types";
import { useWallet } from "@/components/wallet-provider";

export default function AnnotatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const datasetId = Number(id);
  const dataset = useDataset(datasetId);
  const workspace = useLocalWorkspace(datasetId);
  const wallet = useWallet();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [newSample, setNewSample] = useState("");
  const labels = useMemo<LabelDefinition[]>(() => {
    try { return JSON.parse(dataset.data?.label_schema_json ?? "[]"); } catch { return []; }
  }, [dataset.data]);
  const current = workspace.samples[index] ?? null;

  useEffect(() => {
    if (index >= workspace.samples.length) setIndex(Math.max(0, workspace.samples.length - 1));
  }, [index, workspace.samples.length]);

  function submitLocal() {
    if (!current || !selected) return;
    workspace.labelSample(current.id, selected, wallet.address || "local-reviewer");
    setSelected("");
    if (index < workspace.samples.length - 1) setIndex(index + 1);
  }

  if (dataset.loading || !workspace.ready) return <div className="page"><div className="loading-line" /><div className="empty-state">Loading annotation workbench…</div></div>;
  if (dataset.error || !dataset.data) return <div className="page"><div className="notice error" style={{ margin: 16 }}>{dataset.error || "Dataset unavailable."}</div></div>;

  return (
    <div className="page">
      <header className="page-header">
        <div><div className="eyebrow">Routine annotation</div><h1>Annotation workbench</h1><p>{dataset.data.name} · routine labels here are convenience state, not chain truth.</p></div>
        <div className="button-row"><span className="status-tag">LOCAL ONLY · NO TRANSACTION</span><Link className="quiet-button" href={`/datasets/${datasetId}/disagreements`}>View Disputes →</Link></div>
      </header>
      <div className="annotation-layout">
        <aside className="queue">
          <div className="section-head"><span>QUEUE</span><span>{workspace.samples.length}</span></div>
          {workspace.samples.map((sample, sampleIndex) => (
            <div key={sample.id} className={`queue-row ${sampleIndex === index ? "active" : ""}`} onClick={() => { setIndex(sampleIndex); setSelected(""); }}>
              <span className="sample-id">{sample.id}</span><span className="sample-mini">{sample.text}</span>
            </div>
          ))}
          <div className="section-body form-stack">
            <div className="field"><label>Add browser-local sample</label><textarea rows={3} value={newSample} onChange={(e) => setNewSample(e.target.value)} placeholder="Public/non-sensitive text only" /></div>
            <button className="quiet-button" onClick={() => { workspace.addSample(newSample); setNewSample(""); }}>ADD TO LOCAL QUEUE</button>
          </div>
        </aside>
        <section className="sample-pane">
          {current ? <>
            <div className="sample-toolbar"><span>{current.id}</span><span>PUBLIC TEXT / {current.text.length} CHARS</span></div>
            <div className="sample-copy">{current.text}</div>
            <div className="sample-footer"><span>ASSIGNED {current.assignedTo ?? "LOCAL"}</span><span>LAST LABEL {current.lastLabel ?? "—"}</span></div>
          </> : <div className="empty-state" style={{ color: "#596168" }}>No browser-local samples. Add one from the queue rail.</div>}
        </section>
        <aside className="label-rail">
          <div className="section-head"><span>LABEL RAIL</span><span>KEYBOARD 1–{labels.length}</span></div>
          {labels.map((label, labelIndex) => (
            <button key={label.id} className={`label-option ${selected === label.id ? "selected" : ""}`} onClick={() => setSelected(label.id)}>
              <span className="label-name">{label.name}<span className="shortcut">{labelIndex + 1}</span></span><span className="label-code">{label.id}</span>
              <span className="label-definition">{label.definition}</span>
            </button>
          ))}
          <div className="section-body form-stack">
            <button className="action-button" disabled={!current || !selected} onClick={submitLocal}>SUBMIT LOCAL LABEL</button>
            <div className="eyebrow">No transaction is created here.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
