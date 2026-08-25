"use client";

import { use, useMemo, useState } from "react";
import { canonicalJson, downloadJson, sha256Text } from "@/lib/canonical";
import { DATA_MODE } from "@/lib/genlayer/config";
import { useCases, useDataset } from "@/lib/use-data";
import { useLocalWorkspace } from "@/lib/workbench-store";

export default function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const datasetId = Number(id); const dataset = useDataset(datasetId); const cases = useCases(datasetId); const workspace = useLocalWorkspace(datasetId);
  const [includeRoutine, setIncludeRoutine] = useState(true); const [includeRationale, setIncludeRationale] = useState(true); const [digest, setDigest] = useState("");
  const manifest = useMemo(() => ({
    labelledger_manifest: 1,
    provenance: { mode: DATA_MODE, dataset_id: datasetId, generated_at: "GENERATED_AT_DOWNLOAD", authoritative_source: DATA_MODE === "live" ? "GenLayer contract for escalated cases" : "fixture demonstration" },
    dataset: dataset.data ? { name: dataset.data.name, owner: dataset.data.owner, rubric_version: dataset.data.rubric_version, rubric_digest: dataset.data.rubric_digest } : null,
    settled_cases: cases.data.map((item) => ({ case_id: item.case_id, rubric_version: item.rubric_version, status: item.status, final_label: item.final_label, sample_digest: item.sample_digest, precedent_ids: item.precedent_ids, ...(includeRationale ? { rationale: item.rationale } : {}) })),
    ...(includeRoutine ? { browser_local_routine_work: workspace.samples.map((sample) => ({ id: sample.id, votes: sample.votes, lastLabel: sample.lastLabel ?? null, authoritative: false })) } : {}),
  }), [cases.data, dataset.data, datasetId, includeRationale, includeRoutine, workspace.samples]);

  async function prepareDownload() {
    const output = { ...manifest, provenance: { ...manifest.provenance, generated_at: new Date().toISOString() } };
    const hash = await sha256Text(canonicalJson(output)); setDigest(hash); downloadJson(`labelledger-dataset-${datasetId}-manifest.json`, output);
  }

  return <div className="page"><header className="page-header"><div><div className="eyebrow">DATASET {datasetId} / CLIENT-SIDE EXPORT</div><h1>Export center</h1><p>Assemble a manifest without a backend. Browser-local routine work is visibly marked non-authoritative; escalated case status comes from the selected live/fixture source.</p></div><button className="action-button" onClick={() => void prepareDownload()}>DOWNLOAD MANIFEST</button></header>
    {(dataset.loading || cases.loading || !workspace.ready) && <div className="loading-line" />}
    <div className="work-grid"><section className="main-work"><div className="section-head"><span>MANIFEST PREVIEW</span><span>CANONICAL JSON DIGEST ON DOWNLOAD</span></div><pre className="code-block" style={{ minHeight: 520 }}>{JSON.stringify(manifest, null, 2)}</pre></section><aside className="side-work"><div className="section-head"><span>INCLUSION CONTROLS</span><span>LOCAL FILE</span></div><div className="section-body form-stack">
      <label className="button-row"><input type="checkbox" checked={includeRoutine} onChange={(e) => setIncludeRoutine(e.target.checked)} /> Include browser-local routine work</label>
      <label className="button-row"><input type="checkbox" checked={includeRationale} onChange={(e) => setIncludeRationale(e.target.checked)} /> Include bounded settlement rationale</label>
      <div className="notice">No upload occurs. The file is generated and downloaded directly by this browser.</div>
      {digest && <div className="receipt"><div className="receipt-row"><span>SHA-256</span><b>{digest}</b></div></div>}
      <div className="eyebrow">Settled/escalated cases: {cases.data.length}</div><div className="eyebrow">Routine samples: {workspace.samples.length}</div>
    </div></aside></div>
  </div>;
}
