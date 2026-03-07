# Post-Hardening Validator Shim Re-Audit

## 1. Purpose

> Note: `doc/Audits/current-validator-shim-audit.md` is intentionally left unchanged; this document is the post-hardening re-audit snapshot.

This report re-audits the current `calculogic-validator` shim landscape against the current hardened tree-advisor behavior.

It is a **post-hardening inspection** focused on detector accuracy and classification quality, not shim cleanup. No shim moves, deletions, import rewrites, or detector-logic changes are performed in this task.

## 2. Command used

```bash
npm run validate:tree -- --scope=validator
```

Observed run notes:
- Report includes `TREE_SHIM_OUTSIDE_COMPAT` and `TREE_SHIM_SURFACE_PRESENT` findings.
- Process exits with code `2` because warning-level findings are present (expected in report mode when warnings exist).

## 3. Summary

- Total current shim-like files manually confirmed in `calculogic-validator/src`: **18**
  - Confirmed compatibility shim debt (thin re-export legacy forwarders): **15**
  - Intentional canonical/public pass-through entrypoints (non-debt): **3**
- Total files currently reported by tree validator: **16**
- Reported files that match confirmed compatibility shim debt: **15**
- Remaining likely false positives: **0**
- Remaining ambiguous/low-confidence reports: **1** (`calculogic-validator/src/tree/tree-shim-detection.logic.mjs`)
- Likely missed real shim debt cases: **0**

## 4. Current confirmed shim inventory

### 4.1 Confirmed compatibility shims (expected current debt)

Each file below is a thin, single-target forwarding re-export that preserves legacy import surfaces.

| Path | Classification | Why shim | Thin target | Intentional role |
|---|---|---|---|---|
| `calculogic-validator/src/npm-arg-forwarding-guard.logic.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/npm-arg-forwarding-guard.logic.mjs` | Legacy compat preservation |
| `calculogic-validator/src/repository-root.logic.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/repository-root.logic.mjs` | Legacy compat preservation |
| `calculogic-validator/src/source-snapshot.logic.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/source-snapshot.logic.mjs` | Legacy compat preservation |
| `calculogic-validator/src/tree-structure-advisor.host.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./tree/tree-structure-advisor.host.mjs` | Legacy root-level tree advisor compat |
| `calculogic-validator/src/tree-structure-advisor.logic.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./tree/tree-structure-advisor.logic.mjs` | Legacy root-level tree advisor compat |
| `calculogic-validator/src/validator-config.contracts.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/config/validator-config.contracts.mjs` | Legacy compat preservation |
| `calculogic-validator/src/validator-config.logic.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/config/validator-config.logic.mjs` | Legacy compat preservation |
| `calculogic-validator/src/validator-exit-code.logic.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/validator-exit-code.logic.mjs` | Legacy compat preservation |
| `calculogic-validator/src/validator-registry.knowledge.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/validator-registry.knowledge.mjs` | Legacy compat preservation |
| `calculogic-validator/src/validator-report-meta.logic.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/validator-report-meta.logic.mjs` | Legacy compat preservation |
| `calculogic-validator/src/validator-report.contracts.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/validator-report.contracts.mjs` | Legacy compat preservation |
| `calculogic-validator/src/validator-root-files.knowledge.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/validator-root-files.knowledge.mjs` | Legacy compat preservation |
| `calculogic-validator/src/validator-runner.logic.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/validator-runner.logic.mjs` | Legacy compat preservation |
| `calculogic-validator/src/validator-scopes.runtime.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `./core/validator-scopes.runtime.mjs` | Legacy compat preservation |
| `calculogic-validator/src/validators/naming-validator.logic.mjs` | Confirmed thin re-export shim debt | Single-line forwarding export | `../naming/naming-validator.host.mjs` | Legacy validator-path compat |

### 4.2 Shim-like but intentional canonical/public pass-through entrypoints (non-debt)

These are intentionally thin pass-through boundaries and should not be treated as cleanup debt under the current hardened rules.

| Path | Classification | Why shim-like | Thin target(s) | Intentional role |
|---|---|---|---|---|
| `calculogic-validator/src/index.mjs` | Intentional public barrel entrypoint | Export-only public package boundary that forwards canonical module surfaces | `./core/validator-runner.logic.mjs`, `./core/validator-registry.knowledge.mjs`, `./core/validator-report.contracts.mjs`, `./tree/tree-structure-advisor.host.mjs`, `./naming/naming-validator.host.mjs` | Public entrypoint surface |
| `calculogic-validator/naming/src/naming-validator.host.mjs` | Intentional canonical host pass-through | Canonical host→wiring boundary inside naming slice | `./naming-validator.wiring.mjs` | Canonical host boundary |
| `calculogic-validator/src/tree/tree-structure-advisor.host.mjs` | Intentional canonical host pass-through | Canonical host→wiring boundary inside tree slice | `./tree-structure-advisor.wiring.mjs` | Canonical host boundary |

## 5. Tree validator comparison

### 5.1 Reported-file classification

| Reported path | Actual classification | Comparison result | Notes |
|---|---|---|---|
| `calculogic-validator/src/npm-arg-forwarding-guard.logic.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/repository-root.logic.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/source-snapshot.logic.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/tree-structure-advisor.host.mjs` | Confirmed compatibility shim debt | Correct but expected current debt | Legacy root-level compat shim |
| `calculogic-validator/src/tree-structure-advisor.logic.mjs` | Confirmed compatibility shim debt | Correct but expected current debt | Legacy root-level compat shim |
| `calculogic-validator/src/validator-config.contracts.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/validator-config.logic.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/validator-exit-code.logic.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/validator-registry.knowledge.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/validator-report-meta.logic.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/validator-report.contracts.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/validator-root-files.knowledge.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/validator-runner.logic.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/validator-scopes.runtime.mjs` | Confirmed compatibility shim debt | Confirmed shim detection | Correct |
| `calculogic-validator/src/validators/naming-validator.logic.mjs` | Confirmed compatibility shim debt | Correct but expected current debt | Legacy naming-validator compat shim |
| `calculogic-validator/src/tree/tree-shim-detection.logic.mjs` | Runtime detector implementation (not a shim) | Ambiguous / weak-signal-only report | Name-token signal (`shim`) without thin re-export behavior |

### 5.2 Unreported shim-like pass-through files

The command did **not** report:

- `calculogic-validator/src/index.mjs`
- `calculogic-validator/naming/src/naming-validator.host.mjs`
- `calculogic-validator/src/tree/tree-structure-advisor.host.mjs`

Manual assessment: these are intentional canonical/public pass-through entrypoints. Their unflagged status aligns with hardened carveouts, not missed shim debt detection.

## 6. Validation of hardened behavior

### 6.1 Thin re-export shim detection preserved

Confirmed: all 15 currently confirmed compatibility thin re-export shims are still detected by the tree validator.

### 6.2 Non-runtime weak-signal suppression

Confirmed:
- The prior token-only false-positive pattern on `calculogic-validator/test/core-compat-shims.test.mjs` is no longer present in current findings.
- Non-runtime surfaces (tests/docs/examples/fixtures) are not currently producing shim debt findings from weak token-only signals.

### 6.3 Canonical host→wiring carveout

Confirmed:
- `calculogic-validator/naming/src/naming-validator.host.mjs` is intentionally thin but unflagged.
- `calculogic-validator/src/tree/tree-structure-advisor.host.mjs` is intentionally thin but unflagged.

This matches expected canonical host-boundary carveout behavior.

### 6.4 Public `src/index.mjs` barrel carveout

Confirmed:
- `calculogic-validator/src/index.mjs` is intentionally export-only and is unflagged under current behavior.

### 6.5 No important real shim cases lost

Manual inventory of real compatibility shim debt aligns with command coverage: no missed high-confidence real shim debt cases were found.

## 7. Remaining hardening or cleanup opportunities

1. **Optional refinement: reduce weak-signal noise for runtime detector internals.**
   - `calculogic-validator/src/tree/tree-shim-detection.logic.mjs` currently appears as `TREE_SHIM_SURFACE_PRESENT` due naming token signals, despite not being a shim.
   - Current behavior is already materially improved and this is low-severity/low-volume noise.

2. **Policy-level follow-up (outside this task): compat-surface consolidation planning.**
   - Current warnings correctly identify legacy root-level thin re-export debt outside a dedicated compat surface.
   - Cleanup/migration planning can proceed separately once desired compat-surface strategy is chosen.

## 8. Recommended next steps

1. Treat current hardened shim detection as broadly accurate for validator shim debt inventory.
2. If desired, perform one targeted hardening pass for weak-signal runtime noise (`tree-shim-detection.logic.mjs` case) without changing thin re-export coverage.
3. Start a separate shim cleanup/migration planning task (out of scope here) focused on moving/removing the 15 confirmed compatibility shims while preserving public/canonical boundaries.

