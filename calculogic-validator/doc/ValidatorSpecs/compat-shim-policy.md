# Compat Shim Policy (Refactor Aid) — Draft V0.1

## Purpose

Allow **temporary compatibility shims** during refactors so the repo stays runnable between:

1. “move” stage and
2. “repoint” stage

…while preventing long-term ambiguity by making shims:

- unmistakably non-canonical
- time-bounded
- validator-reportable
- easy to delete

## Terms

- **Shim**: a file whose only job is to forward from an old path to a canonical new path.
- **Canonical file**: the real implementation file the shim forwards to.

## Containment Rule (Required)

All shims MUST live under:

- `src/compat/**`

No shims are allowed anywhere else.

Rationale: avoids “two real-looking entrypoints” inside normal namespaces.

## Allowed Shapes (Required)

A shim MUST be one of:

- a direct re-export (ESM export-all / export-named)
- a thin delegator wrapper that calls the canonical function and returns the result

A shim MUST NOT contain:

- business logic
- filesystem walking
- validation logic
- registry definitions
- parsing/normalization logic

If it needs any of that, it is not a shim.

## Required Shim Header (Required)

Every shim file MUST include this header at the top (immediately after any normal file header comment):

```js
// SHIM: compat-deprecated
// Canonical: <repo-relative canonical path>
// Remove-By: <YYYY-MM-DD>
// Repoint-Stage: <short stage token>
// Notes: <one short line>
```

Rules:
• Canonical path is repo-relative, / separators, no ./
• Remove-By is mandatory (date, not a vague milestone)
• Repoint-Stage is mandatory (used to cluster cleanup work)

Shim Allowlist (Required)

Shims MUST be allowlisted in validator config. Any shim not allowlisted is a finding.

Suggested config shape (draft):

```json
{
  "version": "0.1",
  "compatShims": {
    "allow": [
      {
        "path": "calculogic-validator/src/compat/naming-validator.logic.mjs",
        "canonical": "calculogic-validator/naming/src/naming-validator.host.mjs",
        "removeBy": "2026-04-01",
        "repointStage": "repoint-naming-imports"
      }
    ]
  }
}
```

Validator Behavior (Report Mode)

The validator suite MUST emit findings for shims:
• If shim exists AND is allowlisted: warn
Code: COMPAT_SHIM_PRESENT
• If shim exists AND is NOT allowlisted: warn (message: “untracked shim”)
Code: COMPAT_SHIM_UNLISTED
• If shim exists AND Remove-By date is in the past: warn (message: “overdue”)
Code: COMPAT_SHIM_OVERDUE

Findings MUST include in details:
• shim.path
• shim.canonical
• shim.removeBy
• shim.repointStage

Refactor Routine Stages (Normative)
• Stage A — Move + Shim: move canonical files; add compat shims so repo stays runnable.
• Stage B — Repoint: update imports/callers to canonical paths.
• Stage C — Purge: delete shims + remove allowlist entries.

Optional future gate:
• --fail-on-compat-shims (CI) once the team wants Stage C enforced.

Naming (Dev-Friendly Requirement)

Use compat (not legacy) for this policy:
• compat = transitional bridge
• legacy = old implementation that still exists as a real subsystem (different meaning)

Non-Goals
• Shims are not permanent APIs.
• Shims are not a long-term backward compatibility promise.
• Shims must not become a second “normal” module tree.

⸻
