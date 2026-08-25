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
