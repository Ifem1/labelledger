# LabelLedger deployment proof

## Verified deployment

| Field | Value |
|---|---|
| Network | GenLayer StudioNet |
| Chain ID | 61999 |
| Contract | `0xd26FF21A97DF6E32AA18eb72e0af6e902b482F28` |
| Deployment transaction | `0x4d1fecd09c6261e56b7d579a8fe42d9c6a818fc366cc82a5ffa8470f9c6cac1f` |
| Deployment status | FINALIZED |
| GenVM execution | SUCCESS; consensus `MAJORITY_AGREE` |
| Deployed source commit | `1037d5dbe18e497ab01b850151bb2c3a2a3a7c40` |
| Explorer contract | [StudioNet contract](https://explorer-studio.genlayer.com/address/0xd26FF21A97DF6E32AA18eb72e0af6e902b482F28) |
| Explorer deployment transaction | [StudioNet deployment transaction](https://explorer-studio.genlayer.com/tx/0x4d1fecd09c6261e56b7d579a8fe42d9c6a818fc366cc82a5ffa8470f9c6cac1f) |

The deployment receipt was independently queried at FINALIZED and reported empty stdout plus a non-fatal storage warning on stderr. Leader and validator receipts reported successful GenVM execution where completed; validator cancellation after quorum is recorded by the protocol as expected.

## Live proof

- Dataset 1 was created with an unavailable rubric URL in its pinned rubric. Dataset creation transaction: `0xd5ecc5855824437d0715d641717733983cc4557725daf1ebdfe4c7018e089047`. Case 1 finalized as `ABSTAINED`, with no final label and `memory_inserted: false`; abstention transaction: `0x7935d44dd2c10a06cd6c4825811d5f4ce2ae6dcbc54f7c6f61c97790eff1bece`. The other previously cited hash is the dataset-creation operation, not the abstention.
- Dataset 2 is the canonical dataset. Its rubric URL is pinned to the full deployed-source commit and its stored digest is `b616bda3835afcf3f189fbc7a29be12902e7d96fb6dbac942693a47e37283904`.
- Dataset 2 Case A is Case 2. It finalized as `RESOLVED` with `DELIVERY_DISPUTE` and `memory_inserted: true`. Open transaction: `0xce73f47eca906c764a815fee83036da69577e0f005af2ef6cab30a78a292ab49`; resolution transaction: `0x8b3792a4d532b4bd1926eb61597cf3b537140e3c85788336375521fc8b09fb29`.
- Dataset 2 Case B is Case 3. `preview_precedents(3, 6)` returned Case 2 with raw distance `0.027283749`, rubric version `1`, and `same_rubric: true`. Case 3 subsequently finalized as `RESOLVED` with `DELIVERY_DISPUTE`, `precedent_ids: [2]`, and `memory_inserted: true`. Its resolution transaction hash was not captured in the prior release record; the authoritative state was independently re-read.
- Dataset 2 currently reports rubric version `1`, two cases, two resolved cases, and one epoch. `get_epoch(1)` independently verifies Dataset 2, rubric version 1, case IDs `[2]`, manifest digest `b616bda3835afcf3f189fbc7a29be12902e7d96fb6dbac942693a47e37283904`, and seal time `2026-08-25T02:00:21.462547Z`. The epoch transaction hash was not captured, so no hash is claimed.

## Release evidence table

| Evidence | Verified fact |
|---|---|
| Contract deployment | `0x4d1fecd09c6261e56b7d579a8fe42d9c6a818fc366cc82a5ffa8470f9c6cac1f` finalized successfully |
| Negative ABSTAIN proof | Case 1; abstention tx `0x7935d44dd2c10a06cd6c4825811d5f4ce2ae6dcbc54f7c6f61c97790eff1bece` |
| Dataset 2 Case A | Case 2 resolved `DELIVERY_DISPUTE`; open `0xce73f47eca906c764a815fee83036da69577e0f005af2ef6cab30a78a292ab49`; resolution `0x8b3792a4d532b4bd1926eb61597cf3b537140e3c85788336375521fc8b09fb29` |
| Dataset 2 Case B / precedent | Case 3 references Case 2 at distance `0.027283749`; final state independently verified |
| Rubric v2 update | Not performed; Dataset 2 remains v1 |
| Epoch seal | Epoch 1 independently verified; transaction hash not captured |

The hosted frontend is [labelledge.vercel.app](https://labelledge.vercel.app/), configured for live StudioNet reads. No hosted-wallet write is claimed in this document.
