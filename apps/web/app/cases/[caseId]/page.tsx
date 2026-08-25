"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { TxRail } from "@/components/tx-rail";
import { useWallet } from "@/components/wallet-provider";
import { DATA_MODE } from "@/lib/genlayer/config";
import { useCase, usePrecedents } from "@/lib/use-data";
import { useTrackedWrite } from "@/lib/use-tx";
import type { LabelDefinition } from "@/lib/types";

export default function CasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId: raw } = use(params);
  const caseId = Number(raw);
  const record = useCase(caseId);
  const precedents = usePrecedents(caseId);
  const wallet = useWallet();
  const { tx, run } = useTrackedWrite();
  const labels = useMemo<LabelDefinition[]>(() => { try { return JSON.parse(record.data?.label_schema_json ?? "[]"); } catch { return []; } }, [record.data]);
  const disagreement = useMemo<{ votes?: Record<string, number>; total?: number; note?: string }>(() => { try { return JSON.parse(record.data?.disagreement_json ?? "{}"); } catch { return {}; } }, [record.data]);
  const canResolve = DATA_MODE === "live" && wallet.connected && wallet.correctNetwork && record.data?.status === "ESCALATED";

  async function resolve() {
    await run("resolve_case", [BigInt(caseId)], async () => {
      await record.reload();
      await precedents.reload();
    });
  }

  if (record.loading) return <div className="page"><div className="loading-line" /><div className="empty-state">Reading authoritative case…</div></div>;
  if (record.error || !record.data) return <div className="page"><div className="notice error" style={{ margin: 16 }}>{record.error || "Case unavailable."}</div></div>;
  const item = record.data;
  const total = Math.max(1, disagreement.total ?? Object.values(disagreement.votes ?? {}).reduce((sum, value) => sum + value, 0));

  return (
    <div className="page">
      <header className="page-header">
        <div><div className="eyebrow">CASE LL-{String(caseId).padStart(5, "0")} / DATASET {item.dataset_id}</div><h1>Case adjudication</h1><p>Rubric v{item.rubric_version} is frozen to this case. Semantic precedents are related context only; validator consensus determines the canonical label.</p></div>
        <div className="button-row"><span className={`status-tag status-${item.status.toLowerCase()}`}>{item.status}</span><Link className="quiet-button" href={`/datasets/${item.dataset_id}/disagreements`}>INBOX</Link></div>
      </header>
      <div className="case-layout">
        <section>
          <div className="case-sample">
            <div className="sample-id">{item.sample_ref} · SHA256 {item.sample_digest.slice(0, 18)}…</div>
            <blockquote>{item.bounded_text}</blockquote>
          </div>
          <div className="case-meta">
            <div className="meta-cell"><span className="eyebrow">Rubric</span><b>v{item.rubric_version}</b></div>
            <div className="meta-cell"><span className="eyebrow">Opened</span><b>{item.opened_at || "—"}</b></div>
            <div className="meta-cell"><span className="eyebrow">Final label</span><b className={item.final_label ? "signal" : "muted"}>{item.final_label || "UNSET"}</b></div>
            <div className="meta-cell"><span className="eyebrow">Ambiguity</span><b>{item.ambiguity_class || "UNCLASSIFIED"}</b></div>
          </div>
          <div className="section-head"><span>ANNOTATOR DISAGREEMENT / CONTEXT ONLY</span><span>{disagreement.note ?? ""}</span></div>
          <div className="section-body">
            {labels.map((label) => {
              const votes = disagreement.votes?.[label.id] ?? 0;
              return <div className="measure" key={label.id}><span>{label.id}</span><span className="measure-track"><span className="measure-fill" style={{ display: "block", width: `${(votes / total) * 100}%` }} /></span><span>{votes}/{total}</span></div>;
            })}
          </div>
          <div className="section-head"><span>SEMANTIC PRECEDENT FILMSTRIP</span><span>RAW DISTANCE ≠ CONFIDENCE</span></div>
          {precedents.loading && <div className="loading-line" />}
          <div className="precedent-strip">
            {precedents.data.map((precedent) => <article className={`precedent-card ${precedent.same_rubric ? "same" : ""}`} key={precedent.case_id}>
              <div className="eyebrow">CASE {precedent.case_id} / RUBRIC v{precedent.rubric_version} / {precedent.same_rubric ? "CURRENT" : "OLDER"}</div>
              <div className="distance">d² {precedent.distance}</div>
              <h3>{precedent.final_label}</h3>
              <p>{precedent.sample_excerpt}</p>
              <p className="muted">{precedent.rationale}</p>
            </article>)}
            {!precedents.loading && !precedents.data.length && <div className="empty-state" style={{ minWidth: 320 }}>No eligible same-dataset precedent is available.</div>}
          </div>
          {item.status !== "ESCALATED" && <div className="receipt">
            <div className="section-head"><span>AUTHORITATIVE RECEIPT</span><span>CHAIN STATE</span></div>
            <div className="receipt-row"><span>CASE</span><b>LL-{String(caseId).padStart(5, "0")}</b></div>
            <div className="receipt-row"><span>STATUS</span><b>{item.status}</b></div>
            <div className="receipt-row"><span>RUBRIC</span><b>v{item.rubric_version} / {item.rubric_digest}</b></div>
            <div className="receipt-row"><span>LABEL</span><b>{item.final_label || "ABSTAIN / NONE"}</b></div>
            <div className="receipt-row"><span>PRECEDENTS</span><b>{item.precedent_ids.length ? item.precedent_ids.join(", ") : "NONE"}</b></div>
            <div className="receipt-row"><span>RATIONALE</span><b>{item.rationale || "—"}</b></div>
            <div className="receipt-row"><span>MEMORY</span><b>{item.memory_inserted ? "INSERTED ONCE" : "NOT INSERTED"}</b></div>
          </div>}
        </section>
        <aside className="case-labels">
          <div className="section-head"><span>ALLOWED LABELS</span><span>v{item.rubric_version}</span></div>
          {labels.map((label) => <div className={`label-option ${item.final_label === label.id ? "selected" : ""}`} key={label.id}><span className="label-code">{label.id}</span><span className="label-definition">{label.definition}</span></div>)}
          <div className="section-body form-stack">
            <div className="notice">The model cannot introduce a fourth label. A resolved value must be one of the frozen IDs above; otherwise deterministic post-consensus validation rejects it.</div>
            <button className="action-button" disabled={!canResolve} onClick={() => void resolve()}>RUN GENLAYER RESOLUTION</button>
            {DATA_MODE === "fixture" && <div className="muted">Fixture case state is demonstrative and cannot be written.</div>}
            {!wallet.connected && DATA_MODE === "live" && <div className="muted">Connect wallet to trigger permissionless resolution.</div>}
          </div>
        </aside>
      </div>
      <TxRail state={tx} />
    </div>
  );
}
