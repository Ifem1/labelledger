import { ExecutionResult, TransactionStatus } from "genlayer-js/types";
import type { Hash } from "genlayer-js/types";
import { readClient } from "./client";

type FinalizedExecution = {
  receipt: Awaited<ReturnType<typeof readClient.waitForTransactionReceipt>>;
  returnValue: unknown;
};

function bytesFromTraceReturn(value: string): Uint8Array {
  if (value.startsWith("0x")) {
    const hex = value.slice(2);
    return Uint8Array.from(hex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
  }
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodePositiveInt(data: Uint8Array): bigint | undefined {
  let raw = 0n;
  let shift = 0n;
  for (const byte of data) {
    raw += BigInt(byte & 0x7f) << shift;
    if (byte < 0x80) {
      return Number(raw & 0x07n) === 1 ? raw >> 3n : undefined;
    }
    shift += 7n;
  }
  return undefined;
}

export async function waitForSuccessfulFinalization(hash: Hash, onFinalized?: () => void) {
  const receipt = await readClient.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 5_000,
    retries: 90,
  });

  onFinalized?.();
  if (receipt.txExecutionResultName !== ExecutionResult.FINISHED_WITH_RETURN) {
    const result = String(receipt.txExecutionResultName ?? "UNKNOWN");
    throw new Error(`Transaction finalized without successful GenVM execution (${result}).`);
  }
  const trace = await readClient.debugTraceTransaction({ hash });
  let returnValue: unknown = undefined;
  if (trace.return_data) {
    const raw = bytesFromTraceReturn(trace.return_data);
    if (raw[0] === 0) {
      returnValue = decodePositiveInt(raw.slice(1));
    }
  }
  return { receipt, returnValue } satisfies FinalizedExecution;
}
