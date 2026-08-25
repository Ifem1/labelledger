"use client";

import { useCallback, useEffect, useState } from "react";
import { DATA_MODE, hasContract } from "./genlayer/config";
import { DEMO_CASES, DEMO_DATASET, DEMO_EPOCHS, DEMO_PRECEDENTS } from "./demo";
import { readCase, readCaseIds, readDataset, readDatasetCount, readEpoch, readPrecedents } from "./genlayer/contract";
import type { CaseRecord, DatasetRecord, EpochRecord, PrecedentRecord } from "./types";

export type LoadState<T> = { data: T; loading: boolean; error: string };

export function useDataset(datasetId: number) {
  const [state, setState] = useState<LoadState<DatasetRecord | null>>({ data: null, loading: true, error: "" });
  const reload = useCallback(async () => {
    if (DATA_MODE === "fixture") {
      setState({ data: datasetId === 1 ? DEMO_DATASET : null, loading: false, error: datasetId === 1 ? "" : "Fixture dataset not found." });
      return;
    }
    if (!hasContract) {
      setState({ data: null, loading: false, error: "Live mode is enabled, but NEXT_PUBLIC_LABELLEDGER_CONTRACT is not configured." });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try { setState({ data: await readDataset(datasetId), loading: false, error: "" }); }
    catch (error) { setState({ data: null, loading: false, error: error instanceof Error ? error.message : "Dataset read failed." }); }
  }, [datasetId]);
  useEffect(() => { void reload(); }, [reload]);
  return { ...state, reload };
}

export function useDatasets() {
  const [state, setState] = useState<LoadState<DatasetRecord[]>>({ data: [], loading: true, error: "" });
  const reload = useCallback(async () => {
    if (DATA_MODE === "fixture") {
      setState({ data: [DEMO_DATASET], loading: false, error: "" });
      return;
    }
    if (!hasContract) {
      setState({ data: [], loading: false, error: "Live mode is enabled, but no deployed contract address is configured." });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const count = await readDatasetCount();
      const capped = Math.min(count, 50);
      const records = await Promise.all(Array.from({ length: capped }, (_, index) => readDataset(index + 1)));
      setState({ data: records, loading: false, error: count > 50 ? "Showing the first 50 datasets." : "" });
    } catch (error) {
      setState({ data: [], loading: false, error: error instanceof Error ? error.message : "Dataset list read failed." });
    }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  return { ...state, reload };
}

export function useCase(caseId: number) {
  const [state, setState] = useState<LoadState<CaseRecord | null>>({ data: null, loading: true, error: "" });
  const reload = useCallback(async () => {
    if (DATA_MODE === "fixture") {
      const record = DEMO_CASES.find((item) => item.case_id === caseId) ?? null;
      setState({ data: record, loading: false, error: record ? "" : "Fixture case not found." });
      return;
    }
    if (!hasContract) {
      setState({ data: null, loading: false, error: "No deployed contract address is configured." });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try { setState({ data: await readCase(caseId), loading: false, error: "" }); }
    catch (error) { setState({ data: null, loading: false, error: error instanceof Error ? error.message : "Case read failed." }); }
  }, [caseId]);
  useEffect(() => { void reload(); }, [reload]);
  return { ...state, reload };
}

export function useCases(datasetId: number) {
  const [state, setState] = useState<LoadState<CaseRecord[]>>({ data: [], loading: true, error: "" });
  const reload = useCallback(async () => {
    if (DATA_MODE === "fixture") {
      setState({ data: DEMO_CASES.filter((item) => item.dataset_id === datasetId), loading: false, error: "" });
      return;
    }
    if (!hasContract) {
      setState({ data: [], loading: false, error: "No deployed contract address is configured." });
      return;
    }
    try {
      const ids = await readCaseIds(datasetId);
      setState({ data: await Promise.all(ids.map(readCase)), loading: false, error: "" });
    } catch (error) { setState({ data: [], loading: false, error: error instanceof Error ? error.message : "Case list read failed." }); }
  }, [datasetId]);
  useEffect(() => { void reload(); }, [reload]);
  return { ...state, reload };
}

export function usePrecedents(caseId: number) {
  const [state, setState] = useState<LoadState<PrecedentRecord[]>>({ data: [], loading: true, error: "" });
  const reload = useCallback(async () => {
    if (DATA_MODE === "fixture") {
      setState({ data: caseId === 5 ? DEMO_PRECEDENTS : [], loading: false, error: "" });
      return;
    }
    if (!hasContract) { setState({ data: [], loading: false, error: "No deployed contract address is configured." }); return; }
    try { setState({ data: await readPrecedents(caseId), loading: false, error: "" }); }
    catch (error) { setState({ data: [], loading: false, error: error instanceof Error ? error.message : "Precedent read failed." }); }
  }, [caseId]);
  useEffect(() => { void reload(); }, [reload]);
  return { ...state, reload };
}

export function useEpochs(datasetId: number, epochCount: number) {
  const [state, setState] = useState<LoadState<EpochRecord[]>>({ data: [], loading: true, error: "" });
  const reload = useCallback(async () => {
    if (DATA_MODE === "fixture") { setState({ data: DEMO_EPOCHS, loading: false, error: "" }); return; }
    if (!hasContract) { setState({ data: [], loading: false, error: "No deployed contract address is configured." }); return; }
    try {
      const count = Math.min(epochCount, 50);
      setState({ data: await Promise.all(Array.from({ length: count }, (_, index) => readEpoch(index + 1))), loading: false, error: "" });
    } catch (error) { setState({ data: [], loading: false, error: error instanceof Error ? error.message : "Epoch read failed." }); }
  }, [datasetId, epochCount]);
  useEffect(() => { void reload(); }, [reload]);
  return { ...state, reload };
}
