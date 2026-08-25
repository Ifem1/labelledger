import { ExecutionResult, TransactionStatus } from "genlayer-js/types";
import { readClient } from "./client";

export async function waitForSuccessfulFinalization(hash: `0x${string}`, onFinalized?: () => void) {
  const receipt = await readClient.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 5_000,
    retries: 90,
    fullTransaction: false,
  });

  onFinalized?.();
  if (receipt.txExecutionResultName !== ExecutionResult.FINISHED_WITH_RETURN) {
    const result = String(receipt.txExecutionResultName ?? "UNKNOWN");
    throw new Error(`Transaction finalized without successful GenVM execution (${result}).`);
  }
  return receipt;
}
