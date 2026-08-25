import type { CaseRecord, DatasetRecord, EpochRecord, LabelDefinition, LocalSample, PrecedentRecord } from "./types";

export const DEMO_LABELS: LabelDefinition[] = [
  { id: "PAYMENT_DISPUTE", name: "Payment dispute", definition: "Billing, charge, refund, or payment failure is the core dispute." },
  { id: "DELIVERY_DISPUTE", name: "Delivery dispute", definition: "Paid goods or services were not delivered or completed as promised." },
  { id: "IDENTITY_DISPUTE", name: "Identity dispute", definition: "Identity, impersonation, access, or account ownership is the core dispute." },
];

export const DEMO_DATASET: DatasetRecord = {
  dataset_id: 1,
  owner: "0x5A4B…8C21",
  name: "Intent Dispute Boundary Set",
  rubric_url: "https://raw.githubusercontent.com/Ifem1/labelledger/main/docs/demo-rubric.md",
  rubric_digest: "fixture-not-chain-proof",
  rubric_version: 2,
  label_schema_json: JSON.stringify(DEMO_LABELS),
  case_count: 5,
  resolved_count: 3,
  epoch_count: 1,
};

const texts = [
  "they say the job was done but I still haven't received what I paid for",
  "the charge appears twice on my statement and only one order was placed",
  "my parcel shows delivered but nothing was at my address",
  "someone changed the email on my account and now I cannot sign in",
  "the seller agreed to refund me last week but the money has not returned",
  "the courier says the package was handed over but I never received it",
  "I was billed after cancelling before the renewal date",
  "a stranger is using my profile photo and name to contact customers",
  "I paid for installation and the technician never came",
  "the transfer was reversed but the merchant still says I owe them",
  "my order arrived at the wrong building and was returned to sender",
  "I cannot prove whether the person messaging support is the account owner",
  "the invoice amount is higher than the price shown at checkout",
  "the service was marked complete even though the final files were never sent",
  "my account recovery code is being sent to a phone number I do not recognize",
  "I paid for express delivery but the shipment has not left the warehouse",
  "the merchant promised a partial refund but charged another fee instead",
  "support says the account belongs to someone with a different legal name",
  "the booking was paid in full but the provider did not show up",
  "the card charge is correct but I received the wrong item",
  "a refund was approved and the order was returned, but my balance is unchanged",
  "the tracking link says delivered and the building desk says no courier arrived",
  "someone created a second profile using my email address",
  "the subscription renewed at a price I never agreed to",
  "the vendor says the digital product was sent but the download link never worked",
  "my login works but purchase history belongs to another person",
  "the order is here, but the merchant charged for two units instead of one",
  "the repair shop says the work is finished, yet the device has not been returned",
  "a support agent asked me to verify ownership because two people claim this account",
  "I cancelled the order before shipping but was still charged and nothing arrived",
];

function voteFor(index: number): Record<string, number> {
  if ([0, 8, 14, 19, 29].includes(index)) return { PAYMENT_DISPUTE: 2, DELIVERY_DISPUTE: 3, IDENTITY_DISPUTE: 0 };
  if ([2, 5, 10, 15, 21, 24, 27].includes(index)) return { PAYMENT_DISPUTE: 0, DELIVERY_DISPUTE: 5, IDENTITY_DISPUTE: 0 };
  if ([3, 7, 11, 17, 22, 25, 28].includes(index)) return { PAYMENT_DISPUTE: 0, DELIVERY_DISPUTE: 0, IDENTITY_DISPUTE: 5 };
  return { PAYMENT_DISPUTE: 5, DELIVERY_DISPUTE: 0, IDENTITY_DISPUTE: 0 };
}

export const DEMO_SAMPLES: LocalSample[] = texts.map((text, index) => ({
  id: `INT-${String(index + 1).padStart(4, "0")}`,
  text,
  votes: voteFor(index),
  note: [0, 8, 14, 19, 29].includes(index) ? "Boundary case retained for GenLayer escalation." : "Routine browser-local majority.",
  assignedTo: index % 3 === 0 ? "reviewer-a" : index % 3 === 1 ? "reviewer-b" : "reviewer-c",
}));

export const DEMO_CASES: CaseRecord[] = [
  {
    case_id: 1, dataset_id: 1, opener: "0x5A4B…8C21", rubric_version: 1, rubric_digest: "fixture-v1",
    label_schema_json: JSON.stringify(DEMO_LABELS), sample_ref: "demo:INT-0001", sample_digest: "fixture-digest-1",
    bounded_text: texts[0], disagreement_json: JSON.stringify({ votes: { PAYMENT_DISPUTE: 2, DELIVERY_DISPUTE: 3 }, total: 5, note: "payment vs non-delivery" }),
    status: "RESOLVED", status_code: 3, final_label: "DELIVERY_DISPUTE", ambiguity_class: "LABEL_BOUNDARY",
    precedent_ids: [], precedent_distances: [], rationale: "The loss described is the promised service not being received; payment is context rather than the primary failure.",
    opened_at: "2026-08-23T09:14:00Z", resolved_at: "2026-08-23T09:18:12Z", memory_inserted: true,
  },
  {
    case_id: 2, dataset_id: 1, opener: "0x5A4B…8C21", rubric_version: 1, rubric_digest: "fixture-v1",
    label_schema_json: JSON.stringify(DEMO_LABELS), sample_ref: "demo:INT-0009", sample_digest: "fixture-digest-2",
    bounded_text: texts[8], disagreement_json: JSON.stringify({ votes: { PAYMENT_DISPUTE: 2, DELIVERY_DISPUTE: 3 }, total: 5, note: "paid service never performed" }),
    status: "RESOLVED", status_code: 3, final_label: "DELIVERY_DISPUTE", ambiguity_class: "LABEL_BOUNDARY",
    precedent_ids: [1], precedent_distances: ["0.2841"], rationale: "The promised installation never occurred, matching the delivery/service-completion boundary.",
    opened_at: "2026-08-23T09:22:00Z", resolved_at: "2026-08-23T09:26:41Z", memory_inserted: true,
  },
  {
    case_id: 3, dataset_id: 1, opener: "0x5A4B…8C21", rubric_version: 2, rubric_digest: "fixture-v2",
    label_schema_json: JSON.stringify(DEMO_LABELS), sample_ref: "demo:INT-0015", sample_digest: "fixture-digest-3",
    bounded_text: texts[14], disagreement_json: JSON.stringify({ votes: { PAYMENT_DISPUTE: 1, DELIVERY_DISPUTE: 1, IDENTITY_DISPUTE: 3 }, total: 5, note: "recovery vs ownership" }),
    status: "RESOLVED", status_code: 3, final_label: "IDENTITY_DISPUTE", ambiguity_class: "CONFLICTING_SIGNALS",
    precedent_ids: [], precedent_distances: [], rationale: "The unknown recovery destination is material evidence of account-ownership or access ambiguity.",
    opened_at: "2026-08-24T11:03:00Z", resolved_at: "2026-08-24T11:07:58Z", memory_inserted: true,
  },
  {
    case_id: 4, dataset_id: 1, opener: "0x5A4B…8C21", rubric_version: 2, rubric_digest: "fixture-v2",
    label_schema_json: JSON.stringify(DEMO_LABELS), sample_ref: "demo:INT-0020", sample_digest: "fixture-digest-4",
    bounded_text: texts[19], disagreement_json: JSON.stringify({ votes: { PAYMENT_DISPUTE: 2, DELIVERY_DISPUTE: 3 }, total: 5, note: "wrong item after correct charge" }),
    status: "ABSTAINED", status_code: 4, final_label: "", ambiguity_class: "RUBRIC_GAP",
    precedent_ids: [1, 2], precedent_distances: ["0.7312", "0.8420"], rationale: "The current three-label rubric does not cleanly separate wrong-item quality from delivery completion.",
    opened_at: "2026-08-24T11:14:00Z", resolved_at: "2026-08-24T11:19:16Z", memory_inserted: false,
  },
  {
    case_id: 5, dataset_id: 1, opener: "0x5A4B…8C21", rubric_version: 2, rubric_digest: "fixture-v2",
    label_schema_json: JSON.stringify(DEMO_LABELS), sample_ref: "demo:INT-0030", sample_digest: "fixture-digest-5",
    bounded_text: texts[29], disagreement_json: JSON.stringify({ votes: { PAYMENT_DISPUTE: 2, DELIVERY_DISPUTE: 3 }, total: 5, note: "charge and non-delivery co-occur" }),
    status: "ESCALATED", status_code: 1, final_label: "", ambiguity_class: "", precedent_ids: [], precedent_distances: [], rationale: "",
    opened_at: "2026-08-25T00:37:00Z", resolved_at: "", memory_inserted: false,
  },
];

export const DEMO_PRECEDENTS: PrecedentRecord[] = [
  { case_id: 1, rubric_version: 1, same_rubric: false, distance: "0.4187", final_label: "DELIVERY_DISPUTE", sample_excerpt: DEMO_CASES[0].bounded_text, rationale: DEMO_CASES[0].rationale },
  { case_id: 2, rubric_version: 1, same_rubric: false, distance: "0.5034", final_label: "DELIVERY_DISPUTE", sample_excerpt: DEMO_CASES[1].bounded_text, rationale: DEMO_CASES[1].rationale },
  { case_id: 3, rubric_version: 2, same_rubric: true, distance: "1.1162", final_label: "IDENTITY_DISPUTE", sample_excerpt: DEMO_CASES[2].bounded_text, rationale: DEMO_CASES[2].rationale },
];

export const DEMO_EPOCHS: EpochRecord[] = [
  { epoch_id: 1, dataset_id: 1, rubric_version: 1, manifest_url: "sha256:fixture-epoch-1", manifest_digest: "fixture-epoch-1", case_ids: [1, 2], sealed_at: "2026-08-23T10:00:00Z" },
];
