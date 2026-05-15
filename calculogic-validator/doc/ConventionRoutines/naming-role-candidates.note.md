# Naming Role Candidates

## constants

Status: candidate / do not activate yet

Reason it came up:
- Structural Addressing V0 needed centralized exported values for profile ids, bridge output ids, render view ids, marker strategies, formats, and defaults.

Possible meaning:
- Reusable immutable symbolic values used across implementation files.

Concern:
- May describe implementation shape rather than dominant responsibility.
- May overlap with existing roles such as `knowledge`, `config`, `ids`, `tokens`, `registry`, and `settings`.
- Could become a dumping-ground role if activated too early.

Current decision:
- Do not add `constants` as an active role yet.
- Prefer existing roles when the dominant responsibility is clearer:
  - `knowledge` for static/declarative reference data
  - `config` for configurable options/setup policy
  - `ids` for stable identifiers
  - `tokens` for reusable lexical/design/semantic symbols
  - `registry` for canonical registered data
  - `settings` for behavior-tuning values
