# Calculogic File Naming Master List (V1.2)

## Document Status

- **Document Type:** Canonical Naming Specification
- **Status:** Active (Incremental Adoption)
- **Version:** V1.2
- **Effective Scope:** New files, renamed files, refactored/split files, generator-produced files targeting canonical naming
- **Adoption Mode:** Incremental (legacy exceptions allowed until touched/replaced)
- **Owner:** Calculogic Architecture / Repo Naming Contract
- **Primary Audience:** Maintainers, contributors, tooling authors, validators, AI-assisted refactor workflows
- **Last Reviewed:** 2026-02-22
- **Review Trigger:** When adding/changing canonical roles, validator behavior, provenance normalization, or exception policy

## Related Documents

- **Validator / Naming Check Script Spec:** *(add path when created; suggested future path: `doc/ConventionRoutines/NamingValidatorSpec.md`)*
- **Provenance Token Spec (NL/C):** *(add path if separated later; otherwise this document is currently the source for filename normalization rules)*
- **Architecture / Module Boundary Docs:**
  - `doc/ConventionRoutines/CSCS.md`
  - `doc/ConventionRoutines/CCPP.md`
  - `doc/ConventionRoutines/General-NL-Skeletons.md`
  - `doc/ConventionRoutines/NL-First-Workflow.md`
- **Health Check / Reconciliation Docs (naming-related findings):** *(add specific `doc/HealthChecks/...` and/or reconciliation docs when a naming-focused pass exists)*

## Change Control Rules

- Changes to canonical roles **must** update:
  - Role Registry
  - Normalization Rules for Provenance Tokens (NL/C)
  - Validation Rules / validator registry
  - Examples and Non-Examples (if impacted)
- Changes to exception handling **must** update:
  - Allowed Special Cases and Reserved Filenames
  - Validator Rollout Guidance (if enforcement behavior changes)
- Prefer additive, explicit changes over silent wording tweaks that alter meaning.

## Purpose

Define a canonical, explicit, parseable naming system for code files so that:

- humans can understand file purpose immediately
- AI/devs can follow consistent patterns
- validators can parse filenames deterministically
- future exporters/checkers can generate and verify files reliably

This spec is intentionally explicit and semantic (no guessing/inference required).

---

## Table of Contents

- [Purpose](#purpose)
- [Scope and Adoption Policy (V1.1)](#scope-and-adoption-policy-v11)
  - [Scope (what this applies to)](#scope-what-this-applies-to)
  - [Legacy file reality (important)](#legacy-file-reality-important)
  - [Adoption rule](#adoption-rule)
- [Core Filename Grammar](#core-filename-grammar)
  - [Canonical pattern](#canonical-pattern)
  - [Examples](#examples)
- [Segment Definitions](#segment-definitions)
  - [`semantic-name`](#semantic-name)
  - [`role`](#role)
  - [`ext`](#ext)
  - [Concern vs Role vs Format (Important)](#concern-vs-role-vs-format-important)
  - [Concern (CSCS meaning)](#concern-cscs-meaning)
  - [Filename role (this document)](#filename-role-this-document)
  - [Extension/format (implementation detail)](#extensionformat-implementation-detail)
- [Delimiter Rules](#delimiter-rules)
  - [Use `-` for semantic words](#use---for-semantic-words)
  - [Use `.` for role suffix separation](#use--for-role-suffix-separation)
- [Role Registry Master List V1](#role-registry-master-list-v1)
  - [Primary Concern Roles](#primary-concern-roles)
    - [`build`](#build)
    - [`build-style`](#build-style)
    - [`logic`](#logic)
    - [`knowledge`](#knowledge)
    - [`results`](#results)
    - [`results-style`](#results-style)
  - [Structural / Composition Roles](#structural--composition-roles)
    - [`host`](#host)
  - [Integration / Support Roles](#integration--support-roles)
    - [`wiring`](#wiring)
    - [`contracts`](#contracts)
  - [Optional / Future Roles (Not Active by Default)](#optional--future-roles-not-active-by-default)
    - [`adapter` (optional future)](#adapter-optional-future)
    - [`registry` (optional future)](#registry-optional-future)
    - [`selector` (optional future, use carefully)](#selector-optional-future-use-carefully)
- [Legacy Migration and Rename Policy (V1.1)](#legacy-migration-and-rename-policy-v11)
  - [Do not mass-rename by default](#do-not-mass-rename-by-default)
  - [Rename when it is justified](#rename-when-it-is-justified)
  - [Commit hygiene for renames](#commit-hygiene-for-renames)
  - [Superseding legacy names](#superseding-legacy-names)
- [Semantic Naming Rules Master List V1](#semantic-naming-rules-master-list-v1)
  - [Rule 1 — File names must be explicit](#rule-1--file-names-must-be-explicit)
  - [Rule 2 — Prefer concrete target names](#rule-2--prefer-concrete-target-names)
  - [Rule 3 — Subparts belong in semantic-name](#rule-3--subparts-belong-in-semantic-name)
  - [Rule 4 — Avoid generic semantic names unless scoped](#rule-4--avoid-generic-semantic-names-unless-scoped)
  - [Rule 5 — One file, one primary role](#rule-5--one-file-one-primary-role)
- [Filename Parsing Rules V1](#filename-parsing-rules-v1)
  - [Parsing assumptions](#parsing-assumptions)
  - [CSS Modules parsing example (important)](#css-modules-parsing-example-important)
- [Normalization Rules for Provenance Tokens (NL/C)](#normalization-rules-for-provenance-tokens-nlc)
  - [Filename → Token role normalization](#filename--token-role-normalization)
  - [Filename semantic-name → Token file key normalization](#filename-semantic-name--token-file-key-normalization)
  - [Canonical token format](#canonical-token-format)
- [Examples and Non-Examples](#examples-and-non-examples)
  - [Good examples](#good-examples)
  - [Bad examples](#bad-examples)
- [Validation Rules V1 (for future script/test)](#validation-rules-v1-for-future-scripttest)
- [Change Policy V1](#change-policy-v1)
- [Validator Rollout Guidance (V1.1)](#validator-rollout-guidance-v11)
  - [Recommended validator modes](#recommended-validator-modes)
  - [Important](#important)
- [Suggested Initial Active Role Set](#suggested-initial-active-role-set)
- [Role to Extension Guidance (Recommended, Non-Binding) (V1.1)](#role-to-extension-guidance-recommended-non-binding-v11)
  - [Recommended patterns](#recommended-patterns)
  - [Notes](#notes)
- [Allowed Special Cases and Reserved Filenames (V1.1)](#allowed-special-cases-and-reserved-filenames-v11)
  - [1) Barrel files](#1-barrel-files)
  - [2) Framework / tool required filenames](#2-framework--tool-required-filenames)
  - [3) Route / entrypoint convention files (if applicable)](#3-route--entrypoint-convention-files-if-applicable)
  - [4) Test files (if/when covered by separate test naming spec)](#4-test-files-ifwhen-covered-by-separate-test-naming-spec)
  - [5) Type declaration and ambient files](#5-type-declaration-and-ambient-files)
- [Rename Impact Checklist (V1.1)](#rename-impact-checklist-v11)
  - [Required checks](#required-checks)
  - [Sanity checks](#sanity-checks)

---

## Scope and Adoption Policy (V1.1)

This document defines the canonical naming contract for Calculogic code files.

### Scope (what this applies to)

This spec applies to:

- all new files
- all renamed files
- files that are split/refactored as part of architecture work
- files introduced by tooling/generators that target the canonical pattern

### Legacy file reality (important)

Existing files that predate this spec may not follow the canonical pattern yet.

That is allowed temporarily.

Legacy files should be treated as:

- allowed legacy exceptions until touched by meaningful refactor work
- candidates for migration during targeted cleanup passes
- subject to this spec once renamed/replaced

### Adoption rule

Do not block progress solely because unrelated legacy filenames do not match this spec.

Apply this spec incrementally and deliberately.

---

## Core Filename Grammar

### Canonical pattern

`<semantic-name>.<role>.<ext>`

Where `<ext>` may be a simple extension (e.g. `ts`, `tsx`, `css`) or a recognized compound format suffix (e.g. `module.css`).

### Examples

- `leftpanel.host.tsx`
- `leftpanel-tab-selector.wiring.ts`
- `canvas-dropzone.logic.ts`
- `buildsurface-layout.build.tsx`
- `rightpanel.results-style.css`
- `buildsurface.build-style.module.css`

---

## Segment Definitions

### `semantic-name`

**What it means:**  
The target and/or subtarget the file is about (what the file is for).

**Rules:**

- uses kebab-case
- should be explicit and descriptive
- should identify the UI section, feature area, or subpart
- may include multiple semantic segments joined by `-`

**Examples:**

- `leftpanel`
- `leftpanel-tab-selector`
- `buildsurface-panel-layout`
- `canvas-dropzone`
- `rightpanel-inspector`

**Non-examples:**

- `helpers`
- `utils`
- `stuff`
- `misc`
- `temp`

### `role`

**What it means:**  
The canonical architectural purpose of the file (what role the file plays).

**Rules:**

- uses a value from the Role Registry
- role is always the final segment before extension
- role is separated from semantic-name with a `.`

**Examples:**

- `host`
- `wiring`
- `build`
- `logic`
- `build-style`

### `ext`

**What it means:**  
The file extension / implementation format/language.

**Examples:**

- `ts`
- `tsx`
- `css`
- `module.css` *(CSS Modules format)*

**Notes:**

- extension/format does not define architecture role
- role naming is separate and explicit (never inferred from extension alone)
- `module` in `.module.css` means **CSS Modules file format** (tooling-scoped CSS), **not** a Calculogic concern/role/module type
- treat `.module.css` as an implementation-format detail, not a canonical filename role

---

## Concern vs Role vs Format (Important)

This document uses **role** for filename classification.  
That is related to, but not always identical to, CSCS concern naming.

### Concern (CSCS meaning)

A **concern** is an architectural responsibility category in the Calculogic concern system (CSCS), such as:

- `build`
- `build-style`
- `logic`
- `knowledge`
- `results`
- `results-style`

These describe the primary kind of responsibility a file/module handles.

### Filename role (this document)

A **filename role** is the canonical role segment used in `<semantic-name>.<role>.<ext>`.

Some filename roles map directly to CSCS concerns (for example `build`, `logic`, `results-style`).

Other filename roles are **structural/support roles** and are not additional CSCS concerns, such as:

- `host`
- `wiring`
- `contracts`

These roles describe composition/support responsibilities in the naming system.

### Extension/format (implementation detail)

The extension/format describes how a file is implemented, not what architectural role it serves.

Examples:

- `ts`
- `tsx`
- `css`
- `module.css` *(CSS Modules format)*

Examples of the split:

- `buildsurface.build-style.module.css`
  - `build-style` = filename role (concern-aligned)
  - `module.css` = implementation format (CSS Modules)
- `content-resolution.contracts.ts`
  - `contracts` = filename role (support role)
  - `ts` = implementation format

  ---

## Delimiter Rules

### Use `-` for semantic words

Use hyphens inside the semantic name.

- ✅ `leftpanel-tab-selector`
- ✅ `canvas-dropzone`
- ❌ `leftpaneltabselector` (harder to read)
- ❌ `leftpanel_tab_selector` (not preferred unless repo standard changes)

### Use `.` for role suffix separation

Use a dot to separate semantic-name from role.

- ✅ `leftpanel-selector.wiring.ts`
- ✅ `leftpanel.host.tsx`
- ❌ `leftpanel-selector-wiring.ts` (ambiguous role vs semantic segment)

---

## Role Registry Master List V1

This is the canonical role list for filenames.  
(You can expand later through a change process.)

### Primary Concern Roles

#### `build`

**Purpose:**  
Defines local UI structure/content construction for a specific section/component.

**Use when:**

- the file builds/render-structures a local section
- it contains the section’s primary UI composition (not top-level orchestration)

**Do not use when:**

- the file’s main job is arranging multiple sibling sections (use `host`)
- the file is mostly shared integration/wiring (use `wiring`)

#### `build-style`

**Purpose:**  
Defines style concerns tied to the build layer (layout/visual styling for built UI).

**Use when:**

- styling is specific to the build-layer section
- visual/layout rules are separated from build structure for clarity

**Do not use when:**

- styling is for results-layer output (use `results-style`)
- file contains behavior logic (use `logic`)

#### `logic`

**Purpose:**  
Defines interaction/state/behavior logic for a section.

**Use when:**

- event handling, state transitions, interaction logic
- orchestration of local behavior for the section (not structural layout composition)

**Do not use when:**

- file is primarily static config/reference data (use `knowledge`)
- file is mainly shared cross-file integration setup (use `wiring`)

#### `knowledge`

**Purpose:**  
Defines static knowledge/config/schema/reference data used by a section.

**Use when:**

- constants, schema-like data, configuration maps, static definitions
- reference metadata that supports build/logic/results

**Do not use when:**

- values are computed dynamically as behavior logic (use `logic`)
- file becomes a catch-all misc dump

#### `results`

**Purpose:**  
Defines result shaping, result mapping, or result-layer output preparation.

**Use when:**

- output/result processing belongs to the results concern
- transforming data into result-friendly structures

**Do not use when:**

- behavior belongs to general interaction logic (`logic`)
- file is strictly visual styling for results (`results-style`)

#### `results-style`

**Purpose:**  
Defines style concerns for results-layer presentation.

**Use when:**

- styling is specific to results rendering/output views

**Do not use when:**

- styling is for general build layer (`build-style`)
- file contains non-style logic

---

## Legacy Migration and Rename Policy (V1.1)

This section prevents unnecessary churn while still moving the repo toward canonical naming.

### Do not mass-rename by default

Do not mass-rename files only for style consistency unless the pass is explicitly a naming migration / reconciliation / validator rollout pass.

Mass renames create noise and make diffs harder to review.

### Rename when it is justified

Renaming is recommended when one or more of the following is true:

- the file is being substantially edited
- the file is being split (especially a large / mixed-concern file)
- the file’s responsibility is being clarified into a canonical role
- a new architecture boundary is being established
- the rename is needed for validator compatibility / provenance consistency

### Commit hygiene for renames

**Preferred practice:**

- keep rename-only commits isolated when practical
- if rename + refactor must be combined, document the reason clearly in commit/PR notes
- update related NL docs in the same pass when filename references are part of the contract

### Superseding legacy names

When a legacy file is replaced by canonical files:

- prefer small, explicit replacements
- document the replacement mapping in PR notes or reconciliation docs
- preserve semantic intent (do not rename into ambiguity)

---

## Structural / Composition Roles

#### `host`

**Purpose:**  
Composes/places sections or sub-sections and defines structural layout relationships.  
This is the “main file” concept (canonical name).

**Use when:**

- file places panels/sections in overall layout
- file mounts/assembles subparts
- file defines where sections go structurally

**Do not use when:**

- file is mostly local section rendering details (`build`)
- file is mostly integration helpers/shared adapters (`wiring`)

**Examples:**

- `buildsurface.host.tsx`
- `leftpanel.host.tsx` (for nested subpanels)

---

## Integration / Support Roles

#### `wiring`

**Purpose:**  
Connects modules/contracts/helpers and supports composition/integration while reducing repetition.  
This is the “glue file” concept (canonical name).

**Use when:**

- connecting modules together
- registry hookups
- adapter assembly
- shared integration setup
- reducing repeated connection code in concern files

**Do not use when:**

- file becomes a generic junk drawer
- the logic belongs clearly to one concern file (`logic`, `build`, etc.)
- the file has no explicit target/semantic name

**Examples:**

- `leftpanel-tab-selector.wiring.ts`
- `buildsurface-panel-layout.wiring.ts`

#### `contracts`

**Purpose:**  
Defines contract-level shapes, parsing/validation boundaries, normalization contracts, versioned payload expectations, and contract-safe adapters/helpers for a specific semantic target.

**Use when:**

- defining stable input/output shape contracts
- parsing/normalizing persisted payloads into known shapes
- version/shape guard logic is the file’s primary responsibility
- contract behavior should be protected by unit/contract tests

**Do not use when:**

- file is primarily general runtime interaction behavior (`logic`)
- file is static reference/config metadata without contract parsing/validation responsibility (`knowledge`)
- file becomes a mixed “helpers + contracts + wiring” dump

**Examples:**

- `buildsurface-persistence.contracts.ts`
- `content-resolution.contracts.ts` 

---

## Optional / Future Roles (Not Active by Default)

These are placeholders you may adopt later. Keep inactive until explicitly approved.

#### `adapter` (optional future)

**Purpose:**  
Boundary translation between systems/contracts (if you want a more specific role than `wiring`).

#### `registry` (optional future)

**Purpose:**  
Dedicated registration/index mapping file (if this becomes common enough to deserve its own role).

#### `selector` (optional future, use carefully)

**Purpose:**  
Only promote to role if selector files become a stable cross-repo category.

**Current recommendation:** keep `selector` as part of `semantic-name`, not a role.

---

## Semantic Naming Rules Master List V1

### Rule 1 — File names must be explicit

The `semantic-name` should clearly identify what the file is for.

- ✅ `leftpanel-tab-selector.wiring.ts`
- ✅ `rightpanel-inspector.logic.ts`
- ❌ `helpers.ts`
- ❌ `miscLogic.ts`

### Rule 2 — Prefer concrete target names

Use names tied to UI/feature structure.

Examples of strong targets:

- `buildsurface`
- `leftpanel`
- `canvas`
- `rightpanel`
- `inspector`
- `dropzone`
- `tab-selector`

### Rule 3 — Subparts belong in semantic-name

Subparts like `selector`, `layout`, `registry`, `actions`, `mapper`, `viewport` are semantic descriptors unless promoted to canonical roles later.

- ✅ `leftpanel-selector.wiring.ts`
- ✅ `canvas-viewport.logic.ts`

### Rule 4 — Avoid generic semantic names unless scoped

If you need a “helper-like” file, make the target and purpose explicit.

- ✅ `leftpanel-formatting.wiring.ts`
- ✅ `buildsurface-panel-map.wiring.ts`
- ❌ `helpers.wiring.ts`
- ❌ `utils.ts`

### Rule 5 — One file, one primary role

A file can support adjacent concerns, but its filename role should reflect its primary responsibility.

If responsibility is split, refactor.

---

## Filename Parsing Rules V1

Given a filename:

`leftpanel-tab-selector.wiring.ts`

Parse as:

- `semantic-name = leftpanel-tab-selector`
- `role = wiring`
- `ext = ts`

### Parsing assumptions

- role is the last canonical role segment before the extension/format segment
- semantic-name is everything before the role segment
- semantic-name may contain `-`
- role must match the role registry
- extension/format may be a simple extension (e.g. `ts`, `tsx`, `css`) or a recognized compound format (e.g. `module.css`)

### CSS Modules parsing example (important)

Given:

`buildsurface.build-style.module.css`

Parse as:

- `semantic-name = buildsurface`
- `role = build-style`
- `ext/format = module.css` *(CSS Modules format)*

`module` in `module.css` is **not** a filename role and is **not** a Calculogic concern.

---

## Normalization Rules for Provenance Tokens (NL/C)

This bridges filenames to your canonical token format.

### Filename → Token role normalization

- `build` → `Build`
- `build-style` → `BuildStyle`
- `logic` → `Logic`
- `knowledge` → `Knowledge`
- `results` → `Results`
- `results-style` → `ResultsStyle`
- `host` → `Host`
- `wiring` → `Wiring`
- `contracts` → `Contracts`

### Filename semantic-name → Token file key normalization

Convert kebab-case semantic-name to PascalCase.

**Examples:**

- `leftpanel` → `LeftPanel`
- `leftpanel-tab-selector` → `LeftPanelTabSelector`
- `buildsurface-panel-layout` → `BuildSurfacePanelLayout`

### Canonical token format

- `NL::LeftPanelTabSelector.Wiring::1.2.3`
- `C::LeftPanelTabSelector.Wiring::1.2.3`

---

## Examples and Non-Examples

### Good examples

- `buildsurface.host.tsx`
- `leftpanel.host.tsx`
- `leftpanel-tab-selector.wiring.ts`
- `canvas-dropzone.logic.ts`
- `buildsurface-persistence.contracts.ts`
- `rightpanel-inspector.build.tsx`
- `rightpanel.results-style.css`
- `rightpanel.results-style.module.css`

### Bad examples

- `helpers.ts` (no explicit target, no explicit role)
- `misc.ts` (ambiguous)
- `leftpanel-selector-wiring.ts` (role not clearly separated)
- `PanelStuff.tsx` (vague and inconsistent)
- `leftpanel.logic-helper.ts` (multiple roles implied; unclear primary role)
- `contracts.ts` (no explicit semantic target)

---

## Validation Rules V1 (for future script/test)

A validator should be able to enforce:

1. Filename matches the canonical pattern (`<semantic-name>.<role>.<ext>`), including recognized compound format suffixes (e.g. `.module.css`)
2. `semantic-name` uses kebab-case
3. `role` is in canonical role registry
4. No banned generic filenames unless explicitly scoped/allowed
5. Role suffix is dot-separated (not hyphen-appended)
6. *(Optional)* role-to-extension constraints if you define them later
7. *(Optional)* filename ↔ provenance token consistency checks

---

## Change Policy V1

To add a new canonical role:

1. Define role name
2. Add summary description
3. Define “use when” and “do not use when”
4. Add examples
5. Add normalization mapping for provenance tokens
6. Update validator role registry

This prevents silent drift and synonym sprawl (`glue`, `helper`, `wiring`, `adapter` all being used interchangeably).

When adding a new role, explicitly classify whether it is a concern-aligned role or a structural/support role.

---

## Validator Rollout Guidance (V1.1)

Validation should support incremental adoption.

### Recommended validator modes

1. **Report mode (initial)**
   - report non-canonical filenames
   - classify findings as:
     - canonical
     - legacy-exception
     - allowed-special-case
     - invalid/ambiguous

2. **Soft fail mode (targeted folders)**
   - enforce canonical naming only in selected folders or for changed files

3. **Hard fail mode (mature adoption)**
   - enforce canonical naming for all in-scope code files
   - preserve exception allowlist for framework/tool/barrel cases

### Important

A validator should not force renames of:

- framework-required filenames
- barrel files used as folder export boundaries
- explicitly documented legacy exceptions during phased migration

---

## Suggested Initial Active Role Set

If you want a minimal active set to start:

- `host`
- `wiring`
- `contracts`
- `build`
- `build-style`
- `logic`
- `knowledge`
- `results`
- `results-style`

That gives you:

- your concern system
- your composition files
- your integration support files

without introducing extra role clutter too early.

This is already a usable foundation for:

- repo docs
- AI instructions
- a filename validator
- NL/C provenance token checks

---

## Role to Extension Guidance (Recommended, Non-Binding) (V1.1)

Role defines purpose. Extension/format defines implementation language/runtime surface.

This section is guidance only (not a hard validation rule unless explicitly promoted later).

### Recommended patterns

- `*.host.tsx`
  - UI composition/container entry for a semantic surface
  - may orchestrate sub-sections and structural layout relationships

- `*.wiring.ts` or `*.wiring.tsx`
  - composition/integration wiring
  - provider hookups, adapters, orchestration, assembly, registration, dependency linking

- `*.build.tsx`
  - UI build/render composition for a semantic surface/component
  - primarily presentation assembly (not deep behavior logic)

- `*.build-style.css` or `*.build-style.module.css`
  - default style formats for build-layer style concerns
  - prefer CSS / CSS Modules for framework-agnostic and portable style separation
  - `.module.css` indicates CSS Modules format (tooling-scoped CSS), not a Calculogic role

- `*.logic.ts`
  - pure logic, state transforms, reducers, selectors, parsing, guards, behavioral helpers
  - avoid UI rendering concerns where possible

  - `*.contracts.ts`
  - contract definitions, parsers, guards, normalization boundaries, version/shape checks
  - use when contract responsibility is primary and should remain stable/testable
  - avoid turning `contracts` files into generic helper dumps

- `*.knowledge.ts`
  - static config/schema/registry/meta definitions used by the semantic surface
  - canonical constants, descriptors, definitions, metadata

- `*.results.tsx` or `*.results.ts`
  - result shaping, mapping, presentation assembly for result output
  - may include render-level result composition if UI-facing

- `*.results-style.css` or `*.results-style.module.css`
  - default style formats for results-layer presentation
  - prefer CSS / CSS Modules unless a documented subsystem pattern requires otherwise

  - `.module.css` indicates CSS Modules format (tooling-scoped CSS), not a Calculogic role


### Notes

- Some roles may validly use either `.ts` or `.tsx` depending on whether JSX is required.
- Current repo default for style concerns should be treated as **CSS / CSS Modules** unless a specific subsystem/tooling pattern explicitly documents TS/TSX style-role files.
- TS/TSX style-role files (e.g. `*.build-style.ts`, `*.results-style.tsx`) are allowed only when intentionally adopted for a documented pattern (e.g. style tokens/helpers or framework-specific styling systems).
- Validators should treat role as canonical and extension/format as implementation detail unless stricter enforcement is introduced later.

---

## Allowed Special Cases and Reserved Filenames (V1.1)

Not every file in a repo can or should use `<semantic-name>.<role>.<ext>`.

These are allowed exceptions.

### 1) Barrel files

**Examples:**

- `index.ts`
- `index.tsx`

**Use when:**

- the file exists only to re-export module contents
- the file acts as a folder boundary export surface

**Rules:**

- keep barrel files export-focused
- do not let barrel files become hidden logic sinks
- if a barrel accumulates behavior, split behavior into canonical role files

### 2) Framework / tool required filenames

**Examples (generic):**

- framework config files
- build tool configs
- linter configs
- test runner configs
- environment declaration files

**Rules:**

- external ecosystem conventions override this spec for required filenames
- use canonical naming inside app/module code even when root/tool files are exception names

### 3) Route / entrypoint convention files (if applicable)

If a framework requires route/entry names, those names are allowed as exceptions.

**Rules:**

- keep framework-required names minimal
- move real logic into canonical role files wherever practical

### 4) Test files (if/when covered by separate test naming spec)

Until a dedicated test naming spec exists:

- tests may follow current repo test conventions (e.g. `*.test.mjs`, `*.test.ts`, `*.test.tsx`)
- prefer semantic references in test filenames when possible
- do not force production role suffixes into test files unless the repo adopts that rule intentionally

### 5) Type declaration and ambient files

**Examples:**

- `*.d.ts`

Allowed as implementation-specific exceptions.

---

## Rename Impact Checklist (V1.1)

When renaming a file to canonical format, verify all impacted references and contracts.

### Required checks

- imports updated (relative and aliased)
- exports/barrel exports updated
- dynamic imports / lazy imports updated
- tests updated (paths and references)
- story/demo/example references updated (if present)
- docs / NL references updated where filenames are contract-relevant
- provenance tokens / normalized filename references updated (if filename-derived)
- script/validator snapshots or expected outputs updated (if applicable)

### Sanity checks

- no duplicate old/new file remains by mistake
- no stale import path compiles only due to editor cache
- semantic-name remains correct after rename (not just role suffix changed)