# LabelLedger memory

LabelLedger is contract + frontend only. There is no backend, database, API service, server signer, Worker, D1, R2, or object store.

Target deployment is GenLayer StudioNet (chain 61999) with `genlayer-js` 1.1.8, Next.js 16.3.2, and React 19.2.4. Writes are injected-wallet only. Live mode must never fall back to fixture data.

## Current verified status

- Canonical deployment repository HEAD is `7b2f3b9`; the deployed contract file was last changed in `19366f6`.
- Frontend source type errors were corrected with ES2020, SDK calldata types, and SDK `Hash`.
- Contract requirements now pin `protobuf==5.29.3` to address the GenLayer embeddings import dependency.
- A `gltest.config.yaml` for genlayer-test 0.29.x is present.
- The contract and hosted frontend are now claimed only with the evidence recorded in `DEPLOYMENT.md`; no server signer or backend exists.
- Local release gates verified on the reviewer-fix source: 18 direct tests pass; Python syntax, frontend typecheck, lint, and production build pass. GenVM's three lint checks pass locally; clean GitHub CI is the authoritative SDK-validation gate.
- The current contract is deployed on StudioNet at `0xa198C0a9F20faf982F2d8C2A635dF970d70d493A`; deployment transaction `0x00a485ebbdde01e4afcb3112b716367a1fb8819ba68bcbddd6d09c357cf7820b` is FINALIZED with successful GenVM execution.
- Live reviewer proof: Dataset 2 case ID `1` was taken from the actual `open_case` return, `list_cases(2)` returns `[1]`, epoch ID `1` was taken from `seal_epoch`, `list_epochs(2)` returns `[1]`, `get_epoch(1).dataset_id == 2`, and `list_epochs(1)` returns `[]`.
- The hosted frontend is `https://labelledge.vercel.app/`; production must use live mode and contract `0xa198C0a9F20faf982F2d8C2A635dF970d70d493A`.
