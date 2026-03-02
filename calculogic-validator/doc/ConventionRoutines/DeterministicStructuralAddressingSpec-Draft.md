# Deterministic Structural Addressing Spec (Draft)

## 1. Document Status

- **Status:** Draft (living specification)
- **Purpose:** Define a deterministic structural addressing grammar usable across Calculogic docs, NL skeletons, comments, and future JSON/engine representations.
- **Scope:** Host-letter rules, no-host rules, concern-slot positioning, deep nesting extension, parse/sort assumptions, examples, and deferred decisions.
- **Related docs:**
  - `calculogic-validator/doc/ConventionRoutines/CSCS.md` (canonical concern model/order)
  - `calculogic-validator/doc/ConventionRoutines/CCPP.md` (comment/provenance conventions)
  - `doc/ConventionRoutines/General-NL-Skeletons.md` (NL section structure/order)
  - `doc/ConventionRoutines/NL-First-Workflow.md` (workflow precedence)
  - `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md` (naming pattern baseline)
  - `doc/Architecture/BuildSurfaceGlobalHostSequencePlan.md` (global host sequencing context)
- **Last reviewed:** 2026-02-23

> Terminology note: in this document, unscoped `host` references for address grammar/namespace semantics should be interpreted as `address_host` (see `calculogic-validator/doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md`). UI composition-shell meanings belong to `ui_host_surface` terminology in architecture docs.

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

> Terminology scoping note (V1): within this draft, address syntax/notation rules are treated as `canonical_grammar` concerns, while sequence/slot stability is treated as `canonical_order` concerns (see `calculogic-validator/doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md`).

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

> Draft terminology note: this doc uses **node index** as the canonical machine-facing term for this draft. Historical alternates such as “atom index” and “encapsulation index” may appear only as non-canonical vocabulary references.

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
- Canonical numeric segments must not include leading zeros. Leading-zero numeric segments are invalid in this React App Scope v1 draft.

### 4.6 Sorting Assumptions

For deterministic ordering, numeric segments are compared **numerically**, not lexically.

- Correct numeric order: `...2` before `...10`
- Not allowed as `canonical_order`: lexical string order where `...10` precedes `...2`

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
- `A.01.3` (invalid: `canonical_grammar` numeric segments must not include leading zeros in this React App Scope v1 draft)
- `A.1.x.2` (invalid: placeholder markers such as `x` are non-`canonical_grammar` and not accepted in canonical addresses)

## 10. Open Decisions / Deferred Decisions (Required)

This section remains the broad cross-repo/engine decision backlog.
React App Scope v1 draft closures are recorded in §10.1 and should be treated as scoped guidance, not universal finalization.

Open items still intentionally deferred beyond this scoped pass:

1. **Cross-repo placeholder policy harmonization:**
   - Whether any future non-canonical placeholder workflows should be standardized outside React scope.
2. **CCPP atomic ID host-token finalization across all repos/tools:**
   - React scope currently keeps host token context-bound; broader final model remains open.
3. **Future notation portability needs:**
   - Whether any additional display notations are worth formalizing beyond canonical storage grammar.
4. **Vocabulary cleanup across legacy docs:**
   - How/when to migrate historical “atom/encapsulation” wording in untouched materials.
5. **Concern alias publishing conventions in external documentation:**
   - How to present semantic aliases (if at all) outside canonical address strings.
6. **Potential host-token expansion for future engines:**
   - Whether any non-React scope requires multi-letter host identifiers later.
7. **Parser strictness profiles across products:**
   - Whether strict canonical rejection should remain universal or be profile-configurable in future systems.

Until broader decisions are finalized, this draft should be interpreted as a living specification with scoped closures where explicitly stated.

### 10.1 Current Draft v1 Decisions (React App Scope)

For the current React repository usage, the following parser/notation decisions are **closed for v1 draft purposes**.
Classification: `Draft-Assumption` (scoped draft closure guidance, not global final law).

1. **Placeholder `x`**
   - `x` is **not canonical** in structural addresses.
   - Placeholder markers may appear only in explicitly marked illustrative/template contexts and must not appear in canonical addresses.

2. **Host token in CCPP atomic IDs**
   - Host token remains **externally bound/context-bound** for now.
   - Bracketed CCPP atomic IDs are not required to embed host token in this React App Scope v1 draft.

3. **Notation policy**
   - Structural addresses use **one canonical notation** defined by this grammar.
   - Any alternate human-friendly representation is non-canonical display/prose only.
   - Rationale: a single canonical notation preserves deterministic parsing and simplifies normalization.

4. **Canonical term**
   - `node` is the canonical machine-facing term in this spec for React App Scope v1 draft usage.
   - Historical alternates may be referenced only as non-canonical vocabulary notes.

5. **Concern presentation style**
   - Canonical address notation uses **numeric concern slot values only**.
   - Semantic aliases such as `3(Build)` are non-canonical prose/display forms only.

6. **Host token width**
   - Current v1 draft grammar remains **single-letter host token only** (`A`–`Z`).

7. **Leading-zero policy**
   - Leading-zero numeric segments are rejected in canonical form.
   - Canonical parsing for this React App Scope v1 draft does not accept leading-zero normalization.

These closures resolve ambiguity for current React-repo draft usage while preserving future cross-repo/engine flexibility.

### 10.2 Placeholder `x` Legality Matrix (Documentation Classification Rule)

This subsection is the **authoritative source** for `x` placeholder legality in this React repository's documentation scope.
Classification: `Normative` for placeholder-legality rules in this subsection.
It is a documentation classification rule only; parser/validator/tooling behavior remains deferred as described elsewhere in this draft.

| Context | `x` Allowed? | Classification / Marking Requirement | Notes |
| --- | --- | --- | --- |
| Illustrative examples | Yes, conditionally | **MUST** be labeled `Illustrative` or `Placeholder` near the example block/line. | Allowed only to demonstrate structure shape (for example, unresolved depth/index examples). |
| Template scaffolds | Yes, conditionally | **MUST** be labeled `Illustrative` or `Placeholder`. | Applies to reusable doc templates where concrete canonical addresses are not yet assigned. |
| Canonical structural addresses | No | Not applicable; canonical values must be fully concrete and numeric per grammar. | `x` is non-canonical and invalid in canonical address values. |
| Canonical NL docs/config entries (address metadata intended as real/canonical) | No | Not applicable; address metadata must use canonical concrete addresses. | If placeholder text is temporarily shown for drafting, it must be explicitly marked and treated as non-canonical. |
| CCPP canonical IDs (when referenced from this spec) | No (current React App Scope v1) | Not applicable in canonical IDs. | CCPP atomic IDs remain NL-section authoritative; placeholder `x` is non-canonical unless a future policy explicitly changes this. |
| Migration planning rows | Yes, conditionally | **MUST** be labeled `Placeholder` or `Illustrative` at row/table scope. | Permitted only for transitional planning artifacts that are explicitly non-canonical. |

Marking requirement (normative for docs): examples/templates using placeholder marker `x` **MUST** be explicitly marked `Illustrative` or `Placeholder` to avoid ambiguous interpretation in future scanning/validation workflows.

## 11. Future Sync Targets (Required)

This draft establishes grammar first. Later passes should synchronize wording/examples in:

- `calculogic-validator/doc/ConventionRoutines/CCPP.md`
- `doc/ConventionRoutines/General-NL-Skeletons.md`
- `doc/ConventionRoutines/NL-First-Workflow.md` (if workflow steps should explicitly reference structural address validation checkpoints)
- `calculogic-validator/doc/ConventionRoutines/CSCS.md` (only if cross-reference section is needed; concern ordering itself remains canonical there)
- Relevant architecture docs where host/address references should be explicit (starting with `doc/Architecture/BuildSurfaceGlobalHostSequencePlan.md`)

## 12. Change Control / Adoption Guidance (Draft)

1. This spec begins as descriptive/clarifying guidance for deterministic interpretation.
2. Do not perform mass rewrites solely to restamp historical addresses.
3. Prefer adopting this grammar in:
   - new NL examples
   - new convention examples
   - new comment patterns where applicable
4. Backfill legacy material incrementally during normal touchpoints.
5. Validator/tooling enforcement remains intentionally deferred until draft grammar decisions are closed and convention wording is stabilized; this document does not define validator modes, parser APIs, or implementation behavior in this closure pass.
6. Structural-address validation is expected to arrive as a future validator slice; when that slice is introduced, suite mode/policy semantics must follow the shared contract in [`ValidatorSuite-Contracts-And-Modes.md`](./ValidatorSuite-Contracts-And-Modes.md).
