# Deterministic Structural Addressing Spec (Draft)

## 1. Document Status

- **Status:** Draft (living specification)
- **Purpose:** Define a deterministic structural addressing grammar usable across Calculogic docs, NL skeletons, comments, and future JSON/engine representations.
- **Scope:** Host-letter rules, no-host rules, concern-slot positioning, deep nesting extension, parse/sort assumptions, examples, and deferred decisions.
- **Related docs:**
  - `doc/ConventionRoutines/CSCS.md` (canonical concern model/order)
  - `doc/ConventionRoutines/CCPP.md` (comment/provenance conventions)
  - `doc/ConventionRoutines/General-NL-Skeletons.md` (NL section structure/order)
  - `doc/ConventionRoutines/NL-First-Workflow.md` (workflow precedence)
  - `doc/ConventionRoutines/FileNamingMasterList-V1_1.md` (naming pattern baseline)
  - `doc/Architecture/BuildSurfaceGlobalHostSequencePlan.md` (global host sequencing context)
- **Last reviewed:** 2026-02-23

## 2. Purpose

This document defines the **deterministic structural addressing layer** used to identify structural units (containers/subcontainers/primitives or equivalent nodes) in a way that is parseable and stable.

This layer **complements and does not replace**:

- CCS/CSCS concern ordering and purity constraints
- CCPP comment/provenance format
- NL-first workflow requirements
- General NL skeleton numbering conventions
- host/surface composition architecture documentation

Addressing answers: “Where is this structural node in a deterministic sequence?”
It does **not** redefine concern semantics, file naming, or provenance policy.

## 3. Core Concepts / Terminology

### 3.1 Structural Address

A dot-separated token sequence that deterministically locates a node within a defined scope.

### 3.2 Host Scope

A local namespace rooted at a host identity. Within that namespace, numeric segments are interpreted relative to the host.

### 3.3 Host Letter

An uppercase alphabetical token (`A`, `B`, `C`, ...) used as the namespace root for host-present addressing.

### 3.4 Host-Local Structure Index

The first numeric segment after a host letter in host-present mode. It represents host-local structural ordering.

### 3.5 Concern Index / Concern Slot

A numeric segment that indicates concern position (aligned with canonical concern order):

- `3` Build
- `4` BuildStyle
- `5` Logic
- `6` Knowledge
- `7` Results
- `8` ResultsStyle

### 3.6 Nested Encapsulation Index (Node Index)

Any subsequent numeric segment after the concern slot representing deeper nesting (container/subcontainer/primitive lineage or equivalent nested units).

> Draft terminology note: this doc uses **node index** as the neutral default term. “atom index” and “encapsulation index” remain viable alternates (see Open Decisions).

### 3.7 No-Host Mode

Addressing mode where no host letter is present. The numeric sequence is interpreted within the artifact-local root namespace.

### 3.8 Local vs Global Meaning

- **Local meaning:** address interpreted inside its declared scope (host-local or artifact-local).
- **Global meaning:** requires explicit context binding (which host/artifact the address belongs to).

Same numeric address can be valid in multiple scopes without collision as long as scope binding is explicit.

### 3.9 Same Foundation, Different Scope

The deterministic sequence model is shared across:

- code comments (CCPP atomic annotations)
- NL skeleton references
- docs/examples
- future JSON/engine projections

Semantics are consistent, while storage and display context differ.

## 4. Deterministic Address Grammar (Draft)

### 4.1 Token Rules

- Host token: `A`–`Z` (single uppercase letter for this draft).
- Numeric token: positive integer (`1`, `2`, `3`, ...).
- Separator: dot (`.`).
- No whitespace inside an address.

> Draft assumption: single-letter host tokens are required for this draft grammar. Future host-token expansion is an explicit open decision in §10.

### 4.2 Forms

#### Host-present form

`<HostLetter>.<HostLocalIndex>.<ConcernIndex>[.<NodeIndex>...]`

Examples: `A.1.3`, `B.3.5.2`, `C.2.3.1.4`

#### No-host form

`<RootStructureIndex>.<ConcernIndex>[.<NodeIndex>...]`

Examples: `1.3`, `3.5.1`, `2.3.1.1.4`

### 4.3 Position Semantics

#### Host-present

1. Host letter (namespace root)
2. Host-local structure index
3. Concern slot
4+ Nested node indices

#### No-host

1. Artifact-local root structure index
2. Concern slot
3+ Nested node indices

### 4.4 Required vs Optional Positions

- Host-present mode requires at least 3 segments.
- No-host mode requires at least 2 segments.
- Any additional segments are nested node depth.

### 4.5 Parsing Assumptions

- Parse left-to-right by dot tokens.
- Determine mode by first token:
  - alpha token => host-present mode
  - numeric token => no-host mode
- Reject mixed or malformed tokens (e.g., `A.1.x`, `A..3`, `.1.3`).
- Leading-zero handling is deferred (see §10). Until resolved, examples in this draft treat leading zeros as non-canonical and therefore invalid under current draft assumptions.

### 4.6 Sorting Assumptions

For deterministic ordering, numeric segments are compared **numerically**, not lexically.

- Correct numeric order: `...2` before `...10`
- Not allowed as canonical sort: lexical string order where `...10` precedes `...2`

Host letters sort alphabetically when comparing across host roots.
Within same host (or same no-host artifact), sort by numeric segment tuple.

## 5. Host-Letter Rules (Required)

1. A host letter **must** be used when the addressed structure is explicitly rooted in a host-scoped namespace.
2. `A`, `B`, `C`, ... represent host identity within the current context, not global semantics by themselves.
3. Host letters function as **local namespace roots**; identical numeric tails across hosts are non-conflicting.
4. Host letters identify scope identity rather than concern type.
5. Parent host references to child hosts may point to child-host root addresses, but child-host internals remain child-owned.
6. Parent hosts are not required to enumerate internal child-host node paths when ownership is delegated.
7. If host identity is omitted, interpretation switches to no-host mode (not host-present shorthand).

## 6. No-Host Rules (Required)

1. No-host mode is used when an artifact/surface has no host identity contract.
2. First numeric segment is interpreted as artifact-local root structure index.
3. Second segment is always the concern slot.
4. Concern ordering in no-host mode uses the same canonical concern indices (`3`–`8`).
5. Additional segments extend nested node depth in the same way as host-present mode.
6. No-host addresses are deterministic only within their artifact-local context unless externally bound.

## 7. Concern Position Rules (Required)

1. Concern is always a **fixed positional slot** in the address sequence.
2. Host-present: concern appears in segment position 3.
3. No-host: concern appears in segment position 2.
4. Concern slot values align with CSCS/General-NL canonical ordering (`3` Build, `4` BuildStyle, `5` Logic, `6` Knowledge, `7` Results, `8` ResultsStyle).
5. Concern numbering semantics are shared across codebase and future program/engine scopes (same foundation, different scope).
6. This spec does not redefine concern purity or dependency rules; it only fixes concern-slot position in structural addresses.

> Clarifying note: concern slots are `3`–`8` (not `1`-based) because earlier positions are reserved for structural scope/placement segments (`HostLetter` + host-local structure index in host-present mode, vs artifact-local root structure index in no-host mode). Canonical CSCS/CCS concern numbering is preserved across both layouts rather than renumbered per mode.

## 8. Deep Nesting Rules (Required)

1. After concern slot, each added numeric segment represents one deeper node encapsulation level.
2. Depth is theoretically unbounded in grammar terms.
3. Practical guidance: when addresses become difficult to read/review (for example, regularly exceeding 6–8 total segments), consider refactoring/splitting structure.
4. Deep nesting must preserve deterministic parent-child interpretation by contiguous prefix.
   - Example: parent of `A.2.3.1.4.2` is `A.2.3.1.4`
5. Do not skip levels in lineage semantics when representing true nesting.

### 8.1 Valid Deep Nesting Examples

- `A.1.3.2.1.4`
- `B.4.5.3.2.2.1`
- `2.3.1.1.3.2`

### 8.2 Undesirable/Confusing Deep Nesting Patterns

- Overloaded addresses mixing non-structural flags in segments (e.g., `A.1.3.mobile.2`) — invalid in this grammar.
- Pseudo-depth where segments encode labels rather than lineage — ambiguous and disallowed.

## 9. Examples and Non-Examples (Required)

### 9.1 Valid Examples

#### Top-level host with local structures

- `A.1.3` => Host `A`, host-local structure `1`, concern Build
- `A.2.5` => Host `A`, host-local structure `2`, concern Logic

#### Nested host context

- `B.1.3.2` => Host `B`, structure root `1`, Build concern, nested node `2`
- Parent host may reference `B.1.3` as child-host entry while child host owns deeper `B.1.3.*`

#### Host-present concern addresses

- `C.3.4` => BuildStyle within host `C`
- `C.3.7.1` => Results within host `C`, nested node `1`

#### No-host concern addresses

- `1.3` => artifact-local structure `1`, Build concern
- `2.6.1` => artifact-local structure `2`, Knowledge concern, nested node `1`

#### Deep nested node addresses

- `A.1.3.1.2.1`
- `3.5.1.4.2`

### 9.2 Non-Examples / Invalid or Ambiguous

- `A.3` (invalid: host-present mode requires at least 3 segments: `HostLetter.HostLocalIndex.ConcernIndex`)
- `1` (invalid: no-host mode missing concern slot)
- `A.1.9` (invalid concern slot under current canonical concern range)
- `AA.1.3` (invalid under current draft grammar: multi-letter host tokens are deferred in §10)
- `A.01.3` (invalid under current draft assumption of canonical non-padded numeric segments; final parser policy remains deferred in §10)
- `A.1.x.2` (invalid under current draft grammar: placeholder markers such as `x` are deferred in §10 and not accepted)

## 10. Open Decisions / Deferred Decisions (Required)

The following items are intentionally unresolved in this draft and require follow-up decisions:

1. **Placeholder segment marker** (e.g., `x`) for unknown positions:
   - Candidate outcomes: adopt with strict rules, defer entirely, or reject.
2. **Host letters in CCPP atomic comment IDs:**
   - Whether host token should appear directly in bracketed IDs or remain context-bound externally.
3. **Dual notation vs single notation:**
   - Whether comments/docs should allow both host-present and host-omitted views for same node.
4. **Term standardization:**
   - Final canonical term among “node”, “atom”, “encapsulation”.
5. **Concern presentation style:**
   - Numeric slots only vs optional semantic aliases (`3(Build)`) in human-facing docs.
6. **Host token width:**
   - Whether to remain single-letter (`A`–`Z`) or permit multi-letter host ids in future.
7. **Leading-zero policy:**
   - Explicit strict prohibition vs parser-normalized acceptance.

Until these decisions are closed, this draft's examples and non-examples should be interpreted as **draft assumptions for consistency**, not final cross-repo mandates.

## 11. Future Sync Targets (Required)

This draft establishes grammar first. Later passes should synchronize wording/examples in:

- `doc/ConventionRoutines/CCPP.md`
- `doc/ConventionRoutines/General-NL-Skeletons.md`
- `doc/ConventionRoutines/NL-First-Workflow.md` (if workflow steps should explicitly reference structural address validation checkpoints)
- `doc/ConventionRoutines/CSCS.md` (only if cross-reference section is needed; concern ordering itself remains canonical there)
- Relevant architecture docs where host/address references should be explicit (starting with `doc/Architecture/BuildSurfaceGlobalHostSequencePlan.md`)

## 12. Change Control / Adoption Guidance (Draft)

1. This spec begins as descriptive/clarifying guidance for deterministic interpretation.
2. Do not perform mass rewrites solely to restamp historical addresses.
3. Prefer adopting this grammar in:
   - new NL examples
   - new convention examples
   - new comment patterns where applicable
4. Backfill legacy material incrementally during normal touchpoints.
5. Validator/tooling enforcement is deferred to a later pass after open decisions are resolved.
