"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { TxRail } from "@/components/tx-rail";
import { useWallet } from "@/components/wallet-provider";
import { sha256Text } from "@/lib/canonical";
import { DATA_MODE } from "@/lib/genlayer/config";
import { readDataset } from "@/lib/genlayer/contract";
import { useDataset } from "@/lib/use-data";
import { useLocalWorkspace } from "@/lib/workbench-store";
import { useTrackedWrite } from "@/lib/use-tx";
import type { LabelDefinition, LocalSample } from "@/lib/types";

function totalVotes(sample: LocalSample) { return Object.values(sample.votes).reduce((sum, value) => sum + value, 0); }

export default function DisagreementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const datasetId = Number(id);
  const dataset = useDataset(datasetId);
  const workspace = useLocalWorkspace(datasetId);
  const wallet = useWallet();
  const { tx, run } = useTrackedWrite();
  const [active, setActive] = useState<string>("");
  const labels = useMemo<LabelDefinition[]>(() => { try { return JSON.parse(dataset.data?.label_schema_json ?? "[]"); } catch { return []; } }, [dataset.data]);
  const canWrite = DATA_MODE === "live" && wallet.connected && wallet.correctNetwork;

  async function escalate(sample: LocalSample) {
    setActive(sample.id);
    const digest = await sha256Text(sample.text.trim());
    const disagreement = JSON.stringify({ votes: sample.votes, note: sample.note });
    let nextCaseId = 0;
    await run("open_case", [BigInt(datasetId), `browser:${sample.id}`, digest, sample.text.trim(), disagreement], async () => {
      const refreshed = await readDataset(datasetId);
      nextCaseId = refreshed.case_count;
      workspace.markEscalated(sample.id, nextCaseId);
      await dataset.reload();
    });
    setActive("");
  }

  return (
    <div className="page">
      <header className="page-header">
        <div><div className="eyebrow">DATASET {datasetId} / ESCALATION BOUNDARY</div><h1>Disagreement inbox</h1><p>Only samples with competing non-zero labels appear here. The exact bounded text is SHA-256 hashed in-browser before the wallet is asked to escalate it.</p></div>
        <Link className="quiet-button" href={`/datasets/${datasetId}/annotate`}>← ANNOTATE</Link>
      </header>
      {(dataset.loading || !workspace.ready) && <div className="loading-line" />}
      {dataset.error && <div className="notice error" style={{ margin: 16 }}>{dataset.error}</div>}
      <div className="table-scroll">
        <table className="sheet-table">
          <thead><tr><th>Sample</th><th>Bounded text</th><th>Vote histogram</th><th>Disagreement note</th><th>State</th><th>Action</th></tr></thead>
          <tbody>
            {workspace.disagreements.map((sample) => {
              const total = Math.max(1, totalVotes(sample));
              return <tr key={sample.id}>
                <td className="mono">{sample.id}</td>
                <td style={{ minWidth: 280 }}>{sample.text}</td>
                <td style={{ minWidth: 250 }}>{labels.map((label) => {
                  const value = sample.votes[label.id] ?? 0;
                  return <div className="measure" key={label.id}><span>{label.id}</span><span className="measure-track"><span className="measure-fill" style={{ display: "block", width: `${(value / total) * 100}%` }} /></span><span>{value}/{total}</span></div>;
                })}</td>
                <td>{sample.note}</td>
                <td>{sample.escalatedCaseId ? <Link className="status-tag status-escalated" href={`/cases/${sample.escalatedCaseId}`}>CASE {sample.escalatedCaseId}</Link> : <span className="status-tag">BROWSER ONLY</span>}</td>
                <td><button className="action-button" disabled={!canWrite || Boolean(sample.escalatedCaseId) || active === sample.id} onClick={() => void escalate(sample)}>{active === sample.id ? "ESCALATING" : "ESCALATE"}</button></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {!workspace.disagreements.length && workspace.ready && <div className="empty-state">No browser-local disagreements yet. Add competing labels in the annotation workbench.</div>}
      <div className="section-body"><div className="notice warning">Browser agreement is evidence/context only. It never authorizes the final label. {DATA_MODE === "fixture" ? "Fixture mode cannot submit writes." : "Live writes require the dataset-owner wallet."}</div></div>
      <TxRail state={tx} />
    </div>
  );
}
