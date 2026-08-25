# Handoff

## 2026-08-25

- Cloned `main` at `b5c0f1b142f89f76e3925a2de08ced998605d9e6` and inspected the contract, direct suite, frontend, and CI.
- Changed the frontend TypeScript target from ES2017 to ES2020.
- Replaced frontend write calldata/hash annotations with `genlayer-js` 1.1.8 `CalldataEncodable` and `Hash` types; removed the unsupported `fullTransaction` receipt option.
- Added `protobuf==5.29.3` to contract requirements.
- Added `gltest.config.yaml` using the installed genlayer-test 0.29.x configuration format.
- Direct `py_compile` passes. Direct tests currently cannot complete in this Windows environment because the runner cannot create its SDK extraction cache under `C:\Users\DELL\.cache\gltest-direct`; this is an environment permission blocker, not a recorded green result.
- Frontend direct TypeScript compilation passes. ESLint/build remain blocked by an incomplete/corrupt local npm install and unavailable native SWC binary; no green lint/build result is claimed.
- No live deployment or hosted frontend was performed because no injected-wallet approval/hosting credentials are available in this environment.
- Clean isolated-cache verification completed: `python -m py_compile contracts/labelledger.py` passed; `pytest -q tests/direct` passed with 14 tests; `genvm-lint check contracts/labelledger.py` passed lint and semantic validation. The Windows host required a short mapped drive and protobuf 5.29.3 installed in the active environment; no contract behavior was changed for these environment issues.
- Clean frontend reinstall completed. `npm run typecheck`, `npm run lint`, and `npm run build` pass. ESLint was configured to permit the existing intentional browser-state hydration effects; the remaining unnecessary dependency warning was removed.
- Added commit-pinned demo rubric source at `docs/demo/rubric-v1.md`. Deployment and hosted proof remain unclaimed until real external transactions and hosting evidence are available.
- Deployed the frozen contract source to StudioNet at `0xd26FF21A97DF6E32AA18eb72e0af6e902b482F28`; deployment transaction `0x4d1fecd09c6261e56b7d579a8fe42d9c6a818fc366cc82a5ffa8470f9c6cac1f` finalized with successful GenVM execution. Canonical deployed source is `1037d5dbe18e497ab01b850151bb2c3a2a3a7c40`.
- Live Dataset 1 negative proof finalized Case 1 as `ABSTAINED` due unavailable rubric evidence, with no label and no memory insertion. Live Dataset 2 Case 2 resolved to `DELIVERY_DISPUTE` and inserted memory exactly once. Case 3 preview returned Case 2 at raw distance `0.027283749` with `same_rubric: true`; the latest authoritative re-read shows Case 3 is now resolved to `DELIVERY_DISPUTE` and references Case 2.
- Current StudioNet re-read shows Dataset 2 has two resolved cases and Epoch 1. Case 3 is now resolved to `DELIVERY_DISPUTE` with precedent `[2]`; Dataset 2 remains rubric v1. The frontend release adds authoritative case rendering, truthful precedent counts, case-safe navigation, and responsive dataset cards.
- Added `DEPLOYMENT.md` with verified contract, transaction, dataset, case, precedent, and fail-closed facts. No hosted frontend or hosted-wallet write is claimed.
