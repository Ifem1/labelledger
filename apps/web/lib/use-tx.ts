"use client";

import { useCallback, useState } from "react";
import { DATA_MODE } from "./genlayer/config";
import { sendLabelLedgerWrite } from "./genlayer/contract";
import type { TxState } from "./types";

export function useTrackedWrite() {
  const [tx, setTx] = useState<TxState>({ stage: "idle" });

  const run = useCallback(async (functionName: string, args: readonly unknown[], after?: () => Promise<void> | void) => {
    if (DATA_MODE === "fixture") {
      setTx({ stage: "failure", message: "Fixture mode is read/demo-only. Switch to live mode with a deployed contract for writes." });
      return false;
    }
    setTx({ stage: "awaiting-signature", message: "Approve the injected-wallet transaction." });
    try {
      const hash = await sendLabelLedgerWrite(functionName, args, (stage, currentHash) => {
        setTx({
          stage,
          hash: currentHash,
          message: stage === "submitted" ? "Transaction hash received; this is not success yet." : stage === "finalizing" ? "Waiting for FINALIZED consensus state." : "FINALIZED reached; inspecting GenVM execution result.",
        });
      });
      await after?.();
      setTx({ stage: "success", hash, message: "GenVM execution succeeded and authoritative state was re-read." });
      return true;
    } catch (error) {
      setTx({ stage: "failure", message: error instanceof Error ? error.message : "Transaction failed." });
      return false;
    }
  }, []);

  return { tx, setTx, run };
}
