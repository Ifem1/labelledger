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

- Dataset 1 is a controlled negative dataset created with an unavailable rubric URL. Case 1 finalized as `ABSTAINED`, with no final label and `memory_inserted: false`. Transaction: `0xd5ecc5855824437d0715d641717733983cc4557725daf1ebdfe4c7018e089047`.
- Dataset 2 is the canonical dataset. Its rubric URL is pinned to the full deployed-source commit and its stored digest is `b616bda3835afcf3f189fbc7a29be12902e7d96fb6dbac942693a47e37283904`.
- Dataset 2 Case A is Case 2. It finalized as `RESOLVED` with `DELIVERY_DISPUTE` and `memory_inserted: true`. Open transaction: `0xce73f47eca906c764a815fee83036da69577e0f005af2ef6cab30a78a292ab49`; resolution transaction: `0x8b3792a4d532b4bd1926eb61597cf3b537140e3c85788336375521fc8b09fb29`.
- Dataset 2 Case B is Case 3. `preview_precedents(3, 6)` returned Case 2 with raw distance `0.027283749`, rubric version `1`, and `same_rubric: true`. Its resolution attempt was not finalized; the case remains `ESCALATED` and is not claimed as resolved.

No hosted frontend deployment or hosted-wallet write is claimed in this document.
