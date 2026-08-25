export type LabelDefinition = {
  id: string;
  name: string;
  definition: string;
};

export type DatasetRecord = {
  dataset_id: number;
  owner: string;
  name: string;
  rubric_url: string;
  rubric_digest: string;
  rubric_version: number;
  label_schema_json: string;
  case_count: number;
  resolved_count: number;
  epoch_count: number;
};

export type CaseStatus = "ESCALATED" | "PENDING" | "RESOLVED" | "ABSTAINED" | "VOIDED";

export type CaseRecord = {
  case_id: number;
  dataset_id: number;
  opener: string;
  rubric_version: number;
  rubric_digest: string;
  label_schema_json: string;
  sample_ref: string;
  sample_digest: string;
  bounded_text: string;
  disagreement_json: string;
  status: CaseStatus;
  status_code: number;
  final_label: string;
  ambiguity_class: string;
  precedent_ids: number[];
  precedent_distances: string[];
  rationale: string;
  opened_at: string;
  resolved_at: string;
  memory_inserted: boolean;
};

export type PrecedentRecord = {
  case_id: number;
  rubric_version: number;
  same_rubric: boolean;
  distance: string;
  final_label: string;
  sample_excerpt: string;
  rationale: string;
};

export type EpochRecord = {
  epoch_id: number;
  dataset_id: number;
  rubric_version: number;
  manifest_url: string;
  manifest_digest: string;
  case_ids: number[];
  sealed_at: string;
};

export type LocalSample = {
  id: string;
  text: string;
  votes: Record<string, number>;
  note: string;
  assignedTo?: string;
  lastLabel?: string;
  escalatedCaseId?: number;
};

export type TxStage =
  | "idle"
  | "awaiting-signature"
  | "submitted"
  | "finalizing"
  | "checking-execution"
  | "success"
  | "failure";

export type TxState = {
  stage: TxStage;
  hash?: string;
  message?: string;
};
