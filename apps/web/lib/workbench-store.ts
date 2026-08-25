"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DATA_MODE } from "./genlayer/config";
import { DEMO_SAMPLES } from "./demo";
import type { LocalSample } from "./types";

const keyFor = (datasetId: number) => `labelledger:workspace:${datasetId}`;
const contributorKey = (datasetId: number) => `labelledger:contributors:${datasetId}`;

export type ContributorEvent = { actor: string; sampleId: string; label: string; at: string };

export function loadSamples(datasetId: number): LocalSample[] {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem(keyFor(datasetId));
  if (saved) {
    try { return JSON.parse(saved) as LocalSample[]; } catch { /* ignore corrupt convenience state */ }
  }
  return DATA_MODE === "fixture" && datasetId === 1 ? DEMO_SAMPLES.map((sample) => ({ ...sample, votes: { ...sample.votes } })) : [];
}

export function saveSamples(datasetId: number, samples: LocalSample[]) {
  window.localStorage.setItem(keyFor(datasetId), JSON.stringify(samples));
}

export function loadContributorEvents(datasetId: number): ContributorEvent[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(contributorKey(datasetId)) ?? "[]") as ContributorEvent[]; } catch { return []; }
}

export function useLocalWorkspace(datasetId: number) {
  const [samples, setSamples] = useState<LocalSample[]>([]);
  const [contributors, setContributors] = useState<ContributorEvent[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSamples(loadSamples(datasetId));
    setContributors(loadContributorEvents(datasetId));
    setReady(true);
  }, [datasetId]);

  const persist = useCallback((next: LocalSample[]) => {
    setSamples(next);
    saveSamples(datasetId, next);
  }, [datasetId]);

  const addSample = useCallback((text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const id = `LOCAL-${Date.now().toString(36).toUpperCase()}`;
    persist([...samples, { id, text: clean, votes: {}, note: "Browser-local sample." }]);
  }, [persist, samples]);

  const labelSample = useCallback((sampleId: string, label: string, actor: string) => {
    const next = samples.map((sample) => sample.id === sampleId ? {
      ...sample,
      votes: { ...sample.votes, [label]: (sample.votes[label] ?? 0) + 1 },
      lastLabel: label,
    } : sample);
    persist(next);
    const events = [...contributors, { actor: actor || "local-reviewer", sampleId, label, at: new Date().toISOString() }];
    setContributors(events);
    window.localStorage.setItem(contributorKey(datasetId), JSON.stringify(events));
  }, [contributors, datasetId, persist, samples]);

  const markEscalated = useCallback((sampleId: string, caseId: number) => {
    persist(samples.map((sample) => sample.id === sampleId ? { ...sample, escalatedCaseId: caseId } : sample));
  }, [persist, samples]);

  const disagreements = useMemo(() => samples.filter((sample) => Object.values(sample.votes).filter((count) => count > 0).length >= 2), [samples]);

  return { ready, samples, contributors, disagreements, addSample, labelSample, markEscalated };
}
