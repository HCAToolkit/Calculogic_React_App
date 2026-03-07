# Current Validator Shim Audit

## 1. Purpose

This audit compares the **current, manually confirmed shim/shim-like file inventory** in `calculogic-validator` against the findings produced by the current tree advisor command.

This is an **inspection-only** report to guide future validator hardening and cleanup planning. It does **not** perform shim cleanup, file moves, import rewrites, or surface consolidation.

## 2. Command used

```bash
npm run validate:tree -- --scope=validator
```

Observed run notes:
- The command returned a report with `TREE_SHIM_OUTSIDE_COMPAT` and `TREE_SHIM_SURFACE_PRESENT` findings for 16 paths.
- The process exited non-zero (`2`) because warnings are present in report output.

## 3. Summary

- Total current shim-like files manually confirmed: **18**
  - Confirmed compatibility shims / expected current debt: **15**
  - Shim-like but intentional canonical/public pass-through entrypoints (non-debt): **3**
- Total files reported by tree validator as shim-like: **16**
- Confirmed matches with real shim cases: **15**
- Likely false positives: **1** (`calculogic-validator/test/core-compat-shims.test.mjs`)
- Ambiguous detections among reported paths: **0**
- Likely missed detections (shim-like not reported): **3** (all intentional pass-through entrypoints)

## 4. Current confirmed shim inventory

### 4.1 Confirmed compatibility shims (expected current debt)

These are thin forwarding modules that preserve legacy import surfaces while forwarding to canonical modules.

| Path | Classification | Why shim | Thin target | Intentional compat preservation |
|---|---|---|---|---|
| `calculogic-validator/src/npm-arg-forwarding-guard.logic.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/npm-arg-forwarding-guard.logic.mjs` | Yes (legacy root-level path retained) |
| `calculogic-validator/src/repository-root.logic.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/repository-root.logic.mjs` | Yes |
| `calculogic-validator/src/source-snapshot.logic.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/source-snapshot.logic.mjs` | Yes |
| `calculogic-validator/src/tree-structure-advisor.host.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./tree/tree-structure-advisor.host.mjs` | Yes (explicitly documented as legacy compat shim) |
| `calculogic-validator/src/tree-structure-advisor.logic.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./tree/tree-structure-advisor.logic.mjs` | Yes (explicitly documented as legacy compat shim) |
| `calculogic-validator/src/validator-config.contracts.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/config/validator-config.contracts.mjs` | Yes |
| `calculogic-validator/src/validator-config.logic.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/config/validator-config.logic.mjs` | Yes |
| `calculogic-validator/src/validator-exit-code.logic.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/validator-exit-code.logic.mjs` | Yes |
| `calculogic-validator/src/validator-registry.knowledge.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/validator-registry.knowledge.mjs` | Yes |
| `calculogic-validator/src/validator-report-meta.logic.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/validator-report-meta.logic.mjs` | Yes |
| `calculogic-validator/src/validator-report.contracts.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/validator-report.contracts.mjs` | Yes |
| `calculogic-validator/src/validator-root-files.knowledge.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/validator-root-files.knowledge.mjs` | Yes |
| `calculogic-validator/src/validator-runner.logic.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/validator-runner.logic.mjs` | Yes |
| `calculogic-validator/src/validator-scopes.runtime.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `./core/validator-scopes.runtime.mjs` | Yes |
| `calculogic-validator/src/validators/naming-validator.logic.mjs` | Confirmed thin re-export shim | Single-line pass-through export | `../naming/naming-validator.host.mjs` | Yes (explicitly documented as legacy compat shim) |

### 4.2 Shim-like but intentional non-debt pass-through entrypoints

These are thin pass-through files but are better treated as canonical/public boundary entrypoints rather than cleanup debt.

| Path | Classification | Why shim-like | Thin target | Intentional role |
|---|---|---|---|---|
| `calculogic-validator/src/index.mjs` | Intentional public barrel pass-through | Multi-export barrel forwarding to canonical slice modules; not a legacy per-file shim | `./core/validator-runner.logic.mjs`, `./core/validator-registry.knowledge.mjs`, `./core/validator-report.contracts.mjs`, plus namespaced exports | Package/public surface entrypoint |
| `calculogic-validator/src/naming/naming-validator.host.mjs` | Intentional canonical host pass-through | Thin `host -> wiring` re-export within canonical naming slice | `./naming-validator.wiring.mjs` | Canonical host boundary, not legacy bridge |
| `calculogic-validator/src/tree/tree-structure-advisor.host.mjs` | Intentional canonical host pass-through | Thin `host -> wiring` re-export within canonical tree advisor slice | `./tree-structure-advisor.wiring.mjs` | Canonical host boundary, not legacy bridge |

## 5. Tree validator comparison

### 5.1 Reported files vs manual classification

| Path | Actual classification | Reported by tree validator | Match status | Notes |
|---|---|---|---|---|
| `calculogic-validator/src/npm-arg-forwarding-guard.logic.mjs` | Confirmed compatibility shim | Yes | Confirmed shim detection | Correct detection |
| `calculogic-validator/src/repository-root.logic.mjs` | Confirmed compatibility shim | Yes | Confirmed shim detection | Correct detection |
| `calculogic-validator/src/source-snapshot.logic.mjs` | Confirmed compatibility shim | Yes | Confirmed shim detection | Correct detection |
| `calculogic-validator/src/tree-structure-advisor.host.mjs` | Confirmed compatibility shim | Yes | Correct but expected debt | Legacy compat surface retained by design |
| `calculogic-validator/src/tree-structure-advisor.logic.mjs` | Confirmed compatibility shim | Yes | Correct but expected debt | Legacy compat surface retained by design |
| `calculogic-validator/src/validator-config.contracts.mjs` | Confirmed compatibility shim | Yes | Confirmed shim detection | Correct detection |
| `calculogic-validator/src/validator-config.logic.mjs` | Confirmed compatibility shim | Yes | Confirmed shim detection | Correct detection |
| `calculogic-validator/src/validator-exit-code.logic.mjs` | Confirmed compatibility shim | Yes | Confirmed shim detection | Correct detection |
| `calculogic-validator/src/validator-registry.knowledge.mjs` | Confirmed compatibility shim | Yes | Correct but expected debt | Explicit legacy shim parity is tested |
| `calculogic-validator/src/validator-report-meta.logic.mjs` | Confirmed compatibility shim | Yes | Confirmed shim detection | Correct detection |
| `calculogic-validator/src/validator-report.contracts.mjs` | Confirmed compatibility shim | Yes | Confirmed shim detection | Correct detection |
| `calculogic-validator/src/validator-root-files.knowledge.mjs` | Confirmed compatibility shim | Yes | Confirmed shim detection | Correct detection |
| `calculogic-validator/src/validator-runner.logic.mjs` | Confirmed compatibility shim | Yes | Correct but expected debt | Explicit legacy shim parity is tested |
| `calculogic-validator/src/validator-scopes.runtime.mjs` | Confirmed compatibility shim | Yes | Correct but expected debt | Explicit legacy shim parity is tested |
| `calculogic-validator/src/validators/naming-validator.logic.mjs` | Confirmed compatibility shim | Yes | Correct but expected debt | Explicitly documented legacy compat shim |
| `calculogic-validator/test/core-compat-shims.test.mjs` | Test file (not shim) | Yes | Likely false positive | Triggered by name token `compat`, not forwarding behavior |

### 5.2 Missed shim-like paths

The following shim-like pass-through files were **not** reported by this command run:

- `calculogic-validator/src/index.mjs`
- `calculogic-validator/src/naming/naming-validator.host.mjs`
- `calculogic-validator/src/tree/tree-structure-advisor.host.mjs`

Manual classification: all three are intentional canonical/public pass-through entrypoints and are likely acceptable to leave unflagged by shim debt heuristics.

## 6. Hardening opportunities

Concrete hardening opportunities for later tree validator work:

1. **Exclude tests/docs/examples/fixtures from shim debt warnings by default**
   - Example: `test/core-compat-shims.test.mjs` is currently flagged due token-only matching.
   - Keep optional observability signal if needed, but suppress debt-oriented warnings for test paths.

2. **Separate strong thin re-export detection from weak name-token detection**
   - Thin re-export-only modules should remain high-confidence shim detections.
   - Token-only matches (`compat`, `shim`, etc.) should be low-confidence unless combined with forwarding behavior or compat-surface placement.

3. **Add explicit confidence tiers or distinct rule codes**
   - Proposed tiers/codes:
     - `thin-reexport-shim` (high confidence)
     - `token-signal-only` (low confidence)
     - `inside-compat-surface` (context signal)
   - This prevents conflating deterministic shim forwarding with naming noise.

4. **Handle intentional canonical pass-through entrypoints explicitly**
   - Host→wiring and package barrel patterns can be recognized as intentional surface topology.
   - Avoid labeling these as debt unless a policy says they are temporary shims.

5. **Clarify compat-related test-file treatment in spec text**
   - Specify whether compat-related test filenames should ever trigger shim advisories.
   - If yes, define a separate non-debt informational code.

6. **Clarify discoverable compat surface expectations**
   - Current warning message recommends compat-surface consolidation; add spec wording for when a root-level legacy shim is allowed as temporary debt vs when strict `compat/` placement is required.

## 7. Recommended next steps

1. Harden shim heuristics/rule coding first (especially test-path exclusions and confidence layering).
2. Re-run this same audit after hardening to verify reduced false positives without losing true shim coverage.
3. Plan shim cleanup as a separate, explicit migration task once hardened detection gives stable inventory confidence.

Cleanup/migration is intentionally out of scope for this audit.
