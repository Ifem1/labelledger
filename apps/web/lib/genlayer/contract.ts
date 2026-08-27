import { CONTRACT_ADDRESS, EXPECTED_CHAIN_HEX, hasContract } from "./config";
import { makeWriteClient, readClient } from "./client";
import { waitForSuccessfulFinalization } from "./execution";
import type { CalldataEncodable, Hash } from "genlayer-js/types";
import type { CaseRecord, DatasetRecord, EpochRecord, PrecedentRecord } from "../types";

function requireContract(): `0x${string}` {
  if (!hasContract) throw new Error("No deployed LabelLedger contract address is configured.");
  return CONTRACT_ADDRESS as `0x${string}`;
}

function parseResult<T>(value: unknown): T {
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return value as T; }
  }
  return value as T;
}

export async function readDatasetCount(): Promise<number> {
  const result = await readClient.readContract({ address: requireContract(), functionName: "dataset_count", args: [] });
  return Number(result);
}

export async function readDataset(id: number): Promise<DatasetRecord> {
  const result = await readClient.readContract({ address: requireContract(), functionName: "get_dataset", args: [BigInt(id)] });
  return parseResult<DatasetRecord>(result);
}

export async function readCase(id: number): Promise<CaseRecord> {
  const result = await readClient.readContract({ address: requireContract(), functionName: "get_case", args: [BigInt(id)] });
  return parseResult<CaseRecord>(result);
}

export async function readEpoch(id: number): Promise<EpochRecord> {
  const result = await readClient.readContract({ address: requireContract(), functionName: "get_epoch", args: [BigInt(id)] });
  return parseResult<EpochRecord>(result);
}

export async function readEpochIds(datasetId: number, offset = 0, limit = 50): Promise<number[]> {
  const result = await readClient.readContract({
    address: requireContract(),
    functionName: "list_epochs",
    args: [BigInt(datasetId), offset, limit],
  });
  return (parseResult<unknown[]>(result) ?? []).map(Number);
}

export async function readCaseIds(datasetId: number, status = 0, offset = 0, limit = 50): Promise<number[]> {
  const result = await readClient.readContract({
    address: requireContract(),
    functionName: "list_cases",
    args: [BigInt(datasetId), status, offset, limit],
  });
  return (parseResult<unknown[]>(result) ?? []).map(Number);
}

export async function readPrecedents(caseId: number, k = 6): Promise<PrecedentRecord[]> {
  const result = await readClient.readContract({
    address: requireContract(),
    functionName: "preview_precedents",
    args: [BigInt(caseId), k],
  });
  return parseResult<PrecedentRecord[]>(result) ?? [];
}

export async function writeContract(
  address: `0x${string}`,
  functionName: string,
  args: readonly CalldataEncodable[],
  onLifecycle?: (stage: "submitted" | "finalizing" | "checking-execution", hash: Hash) => void,
) {
  if (typeof window === "undefined" || !window.ethereum) throw new Error("Injected wallet unavailable.");
  const chainId = String(await window.ethereum.request({ method: "eth_chainId" })).toLowerCase();
  if (chainId !== EXPECTED_CHAIN_HEX.toLowerCase()) {
    throw new Error(`Wrong network. Expected StudioNet chain 61999, wallet reports ${chainId}.`);
  }
  const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
  const account = accounts?.[0] as `0x${string}` | undefined;
  if (!account) throw new Error("Wallet is not connected.");
  const client = makeWriteClient(account);
  const calldata: CalldataEncodable[] = [...args];
  const hash = await client.writeContract({ address, functionName, args: calldata, value: 0n });
  onLifecycle?.("submitted", hash);
  onLifecycle?.("finalizing", hash);
  const execution = await waitForSuccessfulFinalization(hash, () => onLifecycle?.("checking-execution", hash));
  return { hash, returnValue: execution.returnValue };
}

export async function sendLabelLedgerWrite(
  functionName: string,
  args: readonly CalldataEncodable[],
  onLifecycle?: (stage: "submitted" | "finalizing" | "checking-execution", hash: Hash) => void,
) {
  return writeContract(requireContract(), functionName, args, onLifecycle);
}
