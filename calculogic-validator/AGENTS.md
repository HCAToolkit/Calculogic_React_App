# Embedded Validator AGENTS.md

## Scope and Inherited Instructions

This file applies to `calculogic-validator/` in the React-app checkout and adds
Validator-specific guidance to the repository-root `AGENTS.md`. The root file
continues to govern issue/PR discipline, the always-read conventions, NL-first
workflow, status wording, task boundaries, and verification; do not interpret
this file as replacing those inherited requirements.

This directory is the retained pre-extraction Validator. The app's
`@calculogic/validator` dependency is supplied by the pinned standalone
[`HCAToolkit/calculogic-validator`](https://github.com/HCAToolkit/calculogic-validator)
repository, and no app npm script or package dependency executes code from this
directory. It is not a development target and not the development authority for
Validator work; that authority, and the `AGENTS.md` that governs it, belong to the
standalone repository. Retirement of this directory is a **staged implementation
path** tracked in React-app issue #713; edits here are not Validator changes.

One read remains until the standalone health check is decoupled from consumer
documents: the app's `npm run health:validator` conditionally reads
`doc/ConventionRoutines/NamingValidatorSpec.md` from this directory and asserts
that it mentions `src/`, `test/`, and `calculogic-validator/`.

## Path and Working-Directory Conventions

All paths below are relative to this embedded `calculogic-validator/` directory
unless prefixed with `../`. For example,
`doc/ConventionRoutines/NamingValidatorSpec.md` resolves from the React-app root
as
`calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`.

Run package-internal commands only when package documentation explicitly says to
run them from this directory. Commands described as “repo root” or root npm
workflows in `README.md` are React-app-root commands and must be run from `../`.
Do not infer that “repo root” means this embedded directory merely because the
command concerns Validator behavior.

## Validator Task-Specific References

Read the narrowest applicable set in addition to the inherited always-read
conventions.

### Runtime, suite-core, CLI, and shared-helper work

Read in this order when work touches suite-core/shared reuse, cross-slice
implementation, CLI scaffolding, scope/target collection, exit policy, report
metadata, or helper ownership:

1. `doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
2. `doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md`
3. `doc/ConventionRoutines/ValidatorHelperAreas-And-Reuse-Conventions.md`
4. `doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`

Before adding suite-core or cross-slice helper logic, check the suite-owned
capabilities inventory first. Reuse a matching suite-owned capability; otherwise
use the helper-area convention for routing and the loader/converter/runtime
contract for ownership boundaries.

For slice-local runtime, loader, or converter work, read
`doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`.
This requirement includes Naming- and Tree-owned implementations where relevant;
it does not by itself require the other suite-wide/shared-helper references above
when the task is otherwise slice-local.

### Naming work

For naming-validator behavior, naming taxonomy, role/category/status registries,
canonical filename grammar, or naming convention/spec changes, read:

- `doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
- `doc/ConventionRoutines/NamingValidatorSpec.md`

The master list owns canonical filename grammar and taxonomy. The naming spec
owns current naming-slice runtime/spec behavior; do not assume runtime currently
enforces every taxonomy concept in the master list.

### Tree work

Follow the **Canonical Reading Order (Implementation Work)** declared in
`doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md`;
do not maintain or infer a competing order from this file. That order begins
with the suite contract and canonical Tree spec, then uses the Naming spec and
Tree NL/config note as scoped supporting authority/guidance, and reads the
transitional inventory last for navigation and ownership metadata.

The inventory is navigation and ownership guidance only, not runtime authority.
Runtime/spec authority comes from the suite contract plus the canonical Tree
spec. The Naming spec remains authoritative only within its naming-owned scope,
and the Tree NL/config note remains supporting implementation guidance at the
canonical Validator-owned location.

### Registry model work

Read in this order:

1. `doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
2. `doc/ConventionRoutines/NamingValidatorSpec.md`
3. `doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`
4. `doc/ValidatorSpecs/cross-cutting/registry-model-and-slice-interaction.spec.md`
5. `doc/ValidatorSpecs/cross-cutting/registry-blueprint-implementation-map.spec.md`

### Other conditional references

- For structural addresses, address examples, or NL/comment address
  synchronization, read
  `doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`.
- For convention-heavy docs/specs where authoritative, illustrative, or draft
  content could be confused, read
  `doc/ConventionRoutines/DocumentContentClassificationConvention-V1.md` and
  `doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md`.

When work spans multiple authority surfaces, state in the task or PR summary
which documents were runtime authority, navigation-only, and task-scoped
supporting context.

## Validator Ownership and Implementation Rules

- Naming owns filename, semantic-name, and semantic-family interpretation.
- Tree owns folder classification, structural-home reasoning, semantic-home
  reasoning, placement evidence, and whole-placement confidence.
- Runtime loaders own normalization and deterministic runtime interpretation.
- Generated/runtime views consume registry truth and must not become competing
  policy truth.
- Do not make Surface equivalent to Structural Home.
- Do not make Agnostic-Core Meaning replace Category, Role, Surface, or
  Structural Home identity.
- Suite-wide shared concerns belong in semantic suite-core owner areas; slice
  concerns remain in their owning slice. Avoid generic catch-all modules when a
  clearer owner is practical.
- Make implicit reasoning explicit through bounded, inspectable, deterministic
  structures when that improves fidelity to developer mental models.

## Loader, Registry, and Runtime Boundaries

- Keep policy data in registry payloads, normalization in loaders/converters,
  and execution mechanics in runtime/wiring/logic according to the ownership
  contract.
- Use registry-state ownership when composed policy inputs require deterministic
  precedence, canonicalization, digest, or cache state. Use a direct builtin
  loader for bounded slice-local policy without those needs.
- Do not force every registry through a universal state layer or move
  composition mechanics into policy payloads.
- Preserve bounded cross-slice contracts: slices exchange explicit projections,
  not raw internals or duplicated interpretations.

For registry migrations, follow this sequence:

1. docs/spec alignment
2. data-only registry payloads
3. registry shape tests
4. loader compatibility bridges
5. runtime behavior migration
6. extraction preparation

## Validator Verification

- The React-app-root Validator workflows (`validate:*`, `report:*`, and
  `health:validator`) run the installed standalone package, or a live-linked
  standalone checkout for the Validator self-development commands, never the code
  in this directory, so they do not verify Validator behavior changed here. Validator
  behavior changes are made and verified in the standalone repository. Root
  `npm run lint` (`eslint .`) does lint this directory's JavaScript and
  TypeScript files, so run it when a task modifies them.
- Preserve report-first, scope, mode, target, report-envelope, and exit-policy
  contracts when selecting checks.
- Keep checks limited to the touched slice. If a root workflow cannot target the
  touched files, record that limitation rather than expanding the change.
