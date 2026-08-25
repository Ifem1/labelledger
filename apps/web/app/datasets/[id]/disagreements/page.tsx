"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { TxRail } from "@/components/tx-rail";
import { useWallet } from "@/components/wallet-provider";
import { sha256Text } from "@/lib/canonical";
import { DATA_MODE } from "@/lib/genlayer/config";
import { readDataset } from "@/lib/genlayer/contract";
import { useCases, useDataset } from "@/lib/use-data";
import { useLocalWorkspace } from "@/lib/workbench-store";
import { useTrackedWrite } from "@/lib/use-tx";
import type { LabelDefinition, LocalSample } from "@/lib/types";

function totalVotes(sample: LocalSample) { return Object.values(sample.votes).reduce((sum, value) => sum + value, 0); }

export default function DisagreementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const datasetId = Number(id);
  const dataset = useDataset(datasetId);
  const authoritative = useCases(datasetId);
  const workspace = useLocalWorkspace(datasetId);
  const wallet = useWallet();
  const { tx, run } = useTrackedWrite();
  const [active, setActive] = useState<string>("");
  const labels = useMemo<LabelDefinition[]>(() => { try { return JSON.parse(dataset.data?.label_schema_json ?? "[]"); } catch { return []; } }, [dataset.data]);
  const canWrite = DATA_MODE === "live" && wallet.connected && wallet.correctNetwork;
  const statusName = (status: string) => status === "ESCALATED" ? "Awaiting review" : status === "ABSTAINED" ? "Abstained" : status === "VOIDED" ? "Voided" : status === "RESOLVED" ? "Resolved" : "Resolving";

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
        <div><div className="eyebrow">Dataset {datasetId} / Review</div><h1>Disputes</h1><p>Authoritative cases come from StudioNet. Browser-only disagreements remain local until the dataset owner escalates them.</p></div>
        <Link className="quiet-button" href={`/datasets/${datasetId}/annotate`}>← Annotate</Link>
      </header>
      {(dataset.loading || !workspace.ready) && <div className="loading-line" />}
      {dataset.error && <div className="notice error" style={{ margin: 16 }}>{dataset.error}</div>}
      <section className="authoritative-section"><div className="section-head"><span>Authoritative cases</span><span>StudioNet</span></div><div className="table-scroll"><table className="sheet-table"><thead><tr><th>Case</th><th>Sample</th><th>Rubric</th><th>Status</th><th>Final label</th><th>Precedents</th><th>Action</th></tr></thead><tbody>{authoritative.data.map((item) => <tr key={item.case_id}><td className="mono">#{item.case_id}</td><td className="case-excerpt">{item.bounded_text}</td><td>v{item.rubric_version}</td><td><span className={`status-tag status-${item.status.toLowerCase()}`}>{statusName(item.status)}</span></td><td className="mono">{item.final_label || "—"}</td><td>{item.precedent_ids.length}</td><td><Link className="action-button" href={`/cases/${item.case_id}`}>Review Case</Link></td></tr>)}</tbody></table></div>{!authoritative.loading && !authoritative.data.length && <div className="empty-state">No authoritative cases are readable from StudioNet.</div>}</section><section className="local-section"><div className="section-head"><span>Local disagreements</span><span>LOCAL · NOT YET ON-CHAIN</span></div>
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
      </section>
      <div className="section-body"><div className="notice warning">Browser agreement is evidence/context only. It never authorizes the final label. {DATA_MODE === "fixture" ? "Fixture mode cannot submit writes." : "Live writes require the dataset-owner wallet."}</div></div>
      <TxRail state={tx} />
    </div>
  );
}
