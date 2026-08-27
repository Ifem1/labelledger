# LabelLedger deployment proof

## Verified deployment

| Field | Value |
|---|---|
| Network | GenLayer StudioNet |
| Chain ID | 61999 |
| Contract | `0xa198C0a9F20faf982F2d8C2A635dF970d70d493A` |
| Deployment transaction | `0x00a485ebbdde01e4afcb3112b716367a1fb8819ba68bcbddd6d09c357cf7820b` |
| Deployment status | FINALIZED |
| GenVM execution | SUCCESS; consensus `MAJORITY_AGREE` |
| Deployed repository HEAD | `7b2f3b9` (contract last changed in `19366f6`) |
| Explorer contract | [StudioNet contract](https://explorer-studio.genlayer.com/address/0xa198C0a9F20faf982F2d8C2A635dF970d70d493A) |
| Explorer deployment transaction | [StudioNet deployment transaction](https://explorer-studio.genlayer.com/tx/0x00a485ebbdde01e4afcb3112b716367a1fb8819ba68bcbddd6d09c357cf7820b) |

The deployment receipt was queried at `FINALIZED`. It reports contract address `0xa198C0a9F20faf982F2d8C2A635dF970d70d493A`, consensus `MAJORITY_AGREE`, and successful leader GenVM execution. Validator cancellation after quorum is a protocol completion condition, not a failed deployment.

## Live proof

- Dataset 1 creation finalized in transaction `0xee159cb873799e639886f381d545dcc3e086dcc97a4b3e3c68a77bebe2fbb6a0` and returned dataset ID `1`.
- Dataset 2 creation finalized in transaction `0x9747240c396ac88e28acde116dd7b04070454a163ab58013d8c5f26b114ce7b0` and returned dataset ID `2`. `get_dataset(2)` independently returned the expected owner, rubric v1, zero initial cases, and zero initial epochs.
- Dataset 2 `open_case` transaction `0x3c514e2e828a3a46549f4f1237fbace2a3a866ae690d0b06f8d09c40d833930a` finalized successfully and returned the actual global case ID `1`. `list_cases(2, 0, 0, 20)` returned `[1]`, and `get_case(1).dataset_id` returned `2`.
- The case was made terminal with `void_case` transaction `0x40401a355faa88126b7523b344499bfaf97cb5c254c757ac399531f714850091` so an epoch could be sealed without nondeterministic adjudication.
- Dataset 2 `seal_epoch` transaction `0x5ddfcfcb900d882d865f033a36d4d11c1b83a6e8ec469e12f2906a67c1cc6bec` finalized successfully and returned the actual global epoch ID `1`.
- `list_epochs(2, 0, 20)` returned `[1]`; `get_epoch(1)` returned `dataset_id: 2` and `case_ids: [1]`; `list_epochs(1, 0, 20)` returned `[]`. This proves the second dataset cannot be linked through Dataset 1's epoch namespace.
- The frontend consumes the finalized `open_case` return value, validates it as a positive safe integer, and stores that exact value through `workspace.markEscalated`. It does not derive the case ID from before/after case lists.

## Release evidence table

| Evidence | Verified fact |
|---|---|
| Contract deployment | `0x00a485ebbdde01e4afcb3112b716367a1fb8819ba68bcbddd6d09c357cf7820b` finalized successfully |
| Dataset 2 case return | `open_case` tx `0x3c514e2e828a3a46549f4f1237fbace2a3a866ae690d0b06f8d09c40d833930a` returned case ID `1` |
| Dataset-scoped case access | `list_cases(2)` returned `[1]`; `get_case(1).dataset_id == 2` |
| Epoch seal | `0x5ddfcfcb900d882d865f033a36d4d11c1b83a6e8ec469e12f2906a67c1cc6bec` returned epoch ID `1` |
| Dataset-scoped epoch access | Dataset 2 returned `[1]`; epoch 1 belongs to Dataset 2; Dataset 1 returned `[]` |
| Rubric v2 update | Not performed; the reviewer regression proof remains rubric v1 |

The hosted frontend is [labelledge.vercel.app](https://labelledge.vercel.app/), configured for live StudioNet reads. No hosted-wallet write is claimed in this document.
