# LabelLedger memory

LabelLedger is contract + frontend only. There is no backend, database, API service, server signer, Worker, D1, R2, or object store.

Target deployment is GenLayer StudioNet (chain 61999) with `genlayer-js` 1.1.8, Next.js 16.3.2, and React 19.2.4. Writes are injected-wallet only. Live mode must never fall back to fixture data.

## Current verified status

- Repository baseline: `b5c0f1b142f89f76e3925a2de08ced998605d9e6`.
- Frontend source type errors were corrected with ES2020, SDK calldata types, and SDK `Hash`.
- Contract requirements now pin `protobuf==5.29.3` to address the GenLayer embeddings import dependency.
- A `gltest.config.yaml` for genlayer-test 0.29.x is present.
- No StudioNet deployment, hosted frontend, transaction hashes, contract address, or live demo facts are claimed yet.
- Local release gates now verified: 14 direct tests pass; GenVM lint/validation pass; frontend typecheck, lint, and production build pass. The immutable demo rubric is at `docs/demo/rubric-v1.md` and must be referenced by a full source commit URL for any live dataset.
- Frozen contract source `1037d5dbe18e497ab01b850151bb2c3a2a3a7c40` is deployed on StudioNet at `0xd26FF21A97DF6E32AA18eb72e0af6e902b482F28`. Live proof and remaining hosted-frontend gap are recorded in `DEPLOYMENT.md`.
