"use client";

import { EXPLORER_BASE } from "@/lib/genlayer/config";
import type { TxState } from "@/lib/types";

const labels: Record<TxState["stage"], string> = {
  idle: "IDLE",
  "awaiting-signature": "AWAITING SIGNATURE",
  submitted: "SUBMITTED",
  finalizing: "CONSENSUS / FINALITY",
  "checking-execution": "CHECKING GENVM",
  success: "SUCCESS + RE-READ",
  failure: "FAILED",
};

export function TxRail({ state }: { state: TxState }) {
  if (state.stage === "idle") return null;
  return (
    <aside className={`tx-rail tx-${state.stage}`} aria-live="polite">
      <div className="eyebrow">TRANSACTION RAIL</div>
      <strong>{labels[state.stage]}</strong>
      {state.message && <p>{state.message}</p>}
      {state.hash && (
        <a className="mono link" href={`${EXPLORER_BASE}/transactions/${state.hash}`} target="_blank" rel="noreferrer">
          {state.hash.slice(0, 12)}…{state.hash.slice(-8)} ↗
        </a>
      )}
    </aside>
  );
}
