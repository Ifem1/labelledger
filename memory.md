# LabelLedger memory

LabelLedger is contract + frontend only. There is no backend, database, API service, server signer, Worker, D1, R2, or object store.

Target deployment is GenLayer StudioNet (chain 61999) with `genlayer-js` 1.1.8, Next.js 16.3.2, and React 19.2.4. Writes are injected-wallet only. Live mode must never fall back to fixture data.

## Current verified status

- Repository baseline: frontend release work is on top of the frozen contract source commit `1037d5dbe18e497ab01b850151bb2c3a2a3a7c40`.
- Frontend source type errors were corrected with ES2020, SDK calldata types, and SDK `Hash`.
- Contract requirements now pin `protobuf==5.29.3` to address the GenLayer embeddings import dependency.
- A `gltest.config.yaml` for genlayer-test 0.29.x is present.
- The contract and hosted frontend are now claimed only with the evidence recorded in `DEPLOYMENT.md`; no server signer or backend exists.
- Local release gates now verified: 14 direct tests pass; GenVM lint/validation pass; frontend typecheck, lint, and production build pass. The immutable demo rubric is at `docs/demo/rubric-v1.md` and must be referenced by a full source commit URL for any live dataset.
- Frozen contract source `1037d5dbe18e497ab01b850151bb2c3a2a3a7c40` is deployed on StudioNet at `0xd26FF21A97DF6E32AA18eb72e0af6e902b482F28`. Live proof and remaining hosted-frontend gap are recorded in `DEPLOYMENT.md`.
- The hosted frontend is `https://labelledge.vercel.app/`; production must use live mode and the verified contract address. Current StudioNet Dataset 2 reads: rubric v1, 2 cases, 2 resolved, Epoch 1; Case 3 resolved with Case 2 as precedent at distance `0.027283749`.
