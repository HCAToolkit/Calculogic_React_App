# Status Vocabulary Registry (v1)

## Purpose

This registry centralizes migration/tracking status tokens used across migration policy, architecture inventory, execution playbook, reconciliation, and mapping/index docs.

Status meanings are defined here to reduce cross-document drift. Documents should not invent ad-hoc statuses without explicit definition. If a one-off status is temporarily needed, define it locally with deterministic meaning and promote it into this registry in a follow-up conventions pass when it is reused.

This v1 registry is intentionally minimal and does not define transition-graph enforcement.

## Doc Classes

- `policy`: migration/convention policy docs.
- `inventory`: architecture inventory/planning docs with status columns.
- `playbook`: execution-playbook docs that guide migration slices.
- `reconciliation`: migration/reconciliation ledgers and progress notes.
- `mapping-table`: explicit legacy-to-target mapping/index tables.

## Token Registry (v1)

| token            | meaning                                                                                                                             | allowed doc classes                                                  | notes                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `draft`          | Item or row is early/provisional and not yet migration-committed.                                                                   | `inventory`, `reconciliation`                                        | Use only where draft-state tracking is explicitly needed.  |
| `planned`        | Target and migration intent are identified; no active extraction/repoint has landed yet.                                            | `policy`, `inventory`, `playbook`, `reconciliation`, `mapping-table` | Core scaffold status.                                      |
| `in-progress`    | Migration work for the mapped slice/item is actively underway but not yet extracted/repointed complete.                             | `policy`, `inventory`, `playbook`, `reconciliation`, `mapping-table` | Core scaffold status.                                      |
| `extracted`      | Responsibility has been moved to a target path/doc, but active consumers may still use a legacy path/doc until repoint is complete. | `inventory`, `playbook`, `reconciliation`, `mapping-table`           | Transitional status used for partial migration completion. |
| `repointed`      | Active consumers/readers are switched to the canonical target; provenance/mapping links are recorded.                               | `policy`, `inventory`, `playbook`, `reconciliation`, `mapping-table` | Core scaffold status.                                      |
| `legacy-wrapper` | Legacy path/doc remains as a thin forwarding/delegator wrapper with no unique responsibility, pending retirement.                   | `policy`, `inventory`, `playbook`, `reconciliation`, `mapping-table` | Transitional status; should remain short-lived.            |
| `retired`        | Legacy path/doc is no longer canonical and has been fully drained/removed from active use.                                          | `policy`, `inventory`, `playbook`, `reconciliation`, `mapping-table` | Core scaffold status.                                      |
| `deferred`       | Work is intentionally postponed for a later slice/pass and not currently active.                                                    | `policy`, `inventory`, `playbook`, `reconciliation`, `mapping-table` | Use with explicit blocker/dependency note when possible.   |

## Lightweight Add-New-Token Guidance

1. Define the token locally with exact meaning and scope if immediately needed.
2. Use it sparingly until cross-doc reuse is proven.
3. Promote it into this registry in the next conventions pass before broad reuse.
