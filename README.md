# LabelLedger

**Precedent-aware settlement for ambiguous AI dataset labels.**

LabelLedger is a GenLayer contract + frontend product for classification boundaries that ordinary annotators cannot settle confidently. Routine, high-volume annotation remains browser-local. A disputed public sample is bounded and hashed in the browser, escalated through an injected wallet, resolved under the rubric version captured when the case opened, and—only after a canonical resolution—inserted into contract-owned semantic memory as precedent.

> **Deployment status:** the contract is deployed and verified on StudioNet; see [`DEPLOYMENT.md`](DEPLOYMENT.md). A hosted frontend and hosted-wallet write are not yet claimed. The project intentionally has no backend, database, server signer, API service, Worker, D1, R2, or object store.

## Why GenLayer is load-bearing

A normal backend can label text, but it leaves one operator or model as the authority. LabelLedger instead separates four jobs:

1. deterministic contract code freezes dataset/rubric versions, sizes, roles, label IDs and lifecycle rules;
2. VecDB retrieves semantically related, already-resolved same-dataset cases;
3. independent GenLayer validators judge the current rubric-bound semantic question;
4. deterministic post-consensus checks reject impossible labels, stale state, invalid precedent snapshots, or malformed outputs before authoritative state can change.

Similarity never becomes a probability or verdict. A case may explicitly **ABSTAIN** when the public rubric is unavailable, its digest mismatches, or the evidence does not support an allowed label.

## Scope

### On-chain

- dataset owner and current rubric fingerprint;
- immutable rubric-version snapshots and 3–8 label schemas;
- disputed samples with SHA-256-bound bounded text;
- disagreement summaries as context only;
- final canonical label / ambiguity class / rationale;
- selected precedent IDs and raw vector distances;
- resolved-case VecDB memory;
- epoch receipts and client-manifest digests.

### Browser only

- routine annotation queue;
- local votes and disagreement detection;
- contributor convenience log;
- client-generated export manifests.

Browser-local state is never treated as authoritative chain state.

## Contract surface

The deployable contract is [`contracts/labelledger.py`](contracts/labelledger.py).

```text
create_dataset(name, rubric_url, rubric_digest, label_schema_json)
update_rubric(dataset_id, new_url, new_digest, new_label_schema_json)
open_case(dataset_id, sample_ref, sample_digest, bounded_text, disagreement_json)
resolve_case(case_id)
void_case(case_id, reason)
seal_epoch(dataset_id, offchain_manifest_url, manifest_digest, case_ids_json)
get_dataset(dataset_id)
get_rubric(dataset_id, rubric_version)
get_case(case_id)
get_epoch(epoch_id)
preview_precedents(case_id, k)
list_cases(dataset_id, status, offset, limit)
dataset_count()
```

### Core invariants

- a resolved `final_label` must be one of the case's **opening rubric version** label IDs;
- rubric updates create a new snapshot and never rewrite old cases;
- only `RESOLVED` cases enter VecDB, exactly once;
- `ABSTAINED` and `VOIDED` cases do not become precedent;
- VecDB candidates are deterministically filtered to the same dataset namespace;
- same-rubric precedents are prioritized, older versions are marked explicitly;
- epoch case lists must be terminal, unique, same-dataset, and one rubric version;
- missing or digest-mismatched rubric evidence cannot produce a positive resolution.

## Consensus envelope

Validators independently derive and compare the decision-critical fields:

```json
{
  "decision": "RESOLVE | ABSTAIN",
  "label_id": "ALLOWED_SCHEMA_ID_OR_EMPTY",
  "ambiguity_class": "LABEL_BOUNDARY | MISSING_CONTEXT | CONFLICTING_SIGNALS | RUBRIC_GAP | NONE",
  "precedent_material": false,
  "reason": "bounded diagnostic prose"
}
```

`reason` wording is not the equivalence anchor; decision, label, ambiguity class and precedent materiality are.

## Frontend

The Next.js application is in [`apps/web`](apps/web). It follows a dense annotation-workstation visual language rather than a generic AI dashboard.

Routes:

```text
/                                  dataset switchboard
/datasets/[id]/annotate            browser-local annotation workbench
/datasets/[id]/disagreements       disagreement inbox + escalation
/cases/[caseId]                    GenLayer adjudication + precedent filmstrip
/datasets/[id]/rubric              versioned rubric editor/diff
/datasets/[id]/epochs              epoch manifests
/datasets/[id]/contributors        local activity ledger
/datasets/[id]/export              client-side export center
```

### Live vs fixture mode

`NEXT_PUBLIC_LABELLEDGER_DATA=fixture` enables the clearly labeled 30-sample visual fixture. Fixture mode is read/demo-only for chain actions.

`NEXT_PUBLIC_LABELLEDGER_DATA=live` never falls back to fixtures. If the contract address is missing or a read fails, the UI shows an unavailable/error state.

### Wallet safety

- no auto-connect;
- injected EIP-1193 wallet only;
- account/network changes are observed;
- StudioNet chain `61999` is rechecked immediately before each write;
- a transaction hash is only `SUBMITTED`, never success;
- the app waits for `FINALIZED`, checks `txExecutionResultName === FINISHED_WITH_RETURN`, then re-reads contract state.

## Development

### Contract/direct tests

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

The direct suite covers deterministic guards, rubric immutability, wrong-label rejection, abstention, memory namespace isolation, epoch versioning and pagination.

### Frontend

```bash
cd apps/web
npm install
cp ../../.env.example .env.local
npm run typecheck
npm run lint
npm run build
```

For fixture-only visual review:

```bash
NEXT_PUBLIC_LABELLEDGER_DATA=fixture npm run dev
```

For live mode, set `NEXT_PUBLIC_LABELLEDGER_CONTRACT` to the verified StudioNet deployment address.

## Verification truth

This repository does **not** use a generated/local/server private key to claim a live deployment. StudioNet deployment and the first hosted-wallet transaction require the owner's injected wallet and must be recorded only after the finalized transaction has an explicitly successful GenVM execution result.

See [`handoff.md`](handoff.md) and [`memory.md`](memory.md) for current factual status and release blockers.

Live contract and lifecycle evidence are recorded in [`DEPLOYMENT.md`](DEPLOYMENT.md). The canonical deployed contract source is commit `1037d5dbe18e497ab01b850151bb2c3a2a3a7c40`.
