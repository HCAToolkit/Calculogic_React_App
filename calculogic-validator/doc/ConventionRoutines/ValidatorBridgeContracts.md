# Validator Bridge Contracts

Purpose: harden current bridge-contract expectations for validator slices that consume another slice or layer's prepared evidence without taking over that provider's interpretation policy.

Authority: bounded normative supporting spec. Defer primary runtime behavior to `ValidatorSuite-Contracts-And-Modes.md`, slice-owned canonical specs, and current runtime truth. This document narrows the bridge formula in `ValidatorSliceAndReportFormula.md` for the current Naming -> Tree and Addressing -> Tree relationships.

Provenance: implements the bridge-contract hardening recommended by `doc/Audits/validator-slice-formula-alignment.audit.md` after the Slice 2 audit.

Non-goals for this bridge-contract slice:

- Do not change report shape, report ids/descriptions, severity behavior, summary meaning, exit-code behavior, package scripts, or package bins.
- Do not rewrite runner dispatch.
- Do not move Naming interpretation into Tree or suite-core.
- Do not move Tree placement interpretation into Naming, Addressing, or suite-core.
- Do not move Addressing into suite-core.
- Do not make Addressing a standalone runnable validator slice.
- Do not implement Lexical or Coherence.

## 1. Bridge Contract Formula

Every validator bridge relationship uses this model:

| Contract area | Requirement |
| --- | --- |
| Provider-owned prepared output | The provider owns the prepared evidence payload and the interpretation semantics represented in that payload. |
| Consumer-owned consumption only | The consumer may normalize, filter, aggregate, or reason over the prepared evidence for its own findings, but it must not silently re-derive provider-owned meaning when bridge data is absent or incomplete. |
| Explicit bridge contract | The provider output id, consumer input id, provider id, consumer id, staging owner, and runtime boundary must be named in docs or metadata. |
| Bridge output ids | Output ids identify prepared provider evidence. They do not make the consumer the owner of provider policy. |
| Bridge input ids | Input ids identify the consumer seam. They do not grant permission to backfill provider meaning locally. |
| Contract versioning | Add a contract version when a bridge payload has multiple supported shapes or needs migration compatibility. Current contracts are single-shape current implementation reality unless versioned later. |
| Ambiguity / confidence limitations | Provider ambiguity, split-family, confidence, or evidence-strength limits must remain visible to consumers. Consumers may account for those limits in consumer-owned findings. |
| Registry metadata declaration | Runner-visible relationships should be declared in registry metadata. Bridge-provider-only layers that are not runner-visible may be documented outside registry metadata until they become runner-visible. |
| Runtime handoff boundaries | The runner or explicit host/orchestrator owns staging between runnable slices. Local adapters may prepare evidence for a bridge-provider-only layer without making that layer suite-core or Tree-owned. |
| Tests proving no silent re-derivation | Focused tests should prove consumers do not reconstruct provider-owned semantic meaning when bridge evidence is absent, incomplete, or ambiguity-limited. |

## 2. Naming -> Tree Bridge Contract

### 2.1 Current contract identity

| Field | Current value |
| --- | --- |
| Provider id | `naming` |
| Consumer id | `tree-structure-advisor` |
| Bridge output id | `naming-semantic-family-bridge` |
| Bridge input id | `namingSemanticFamilyBridge` |
| Runtime staging owner | `validator-runner` for runner mode; Tree direct wiring accepts a prepared bridge payload when supplied. |
| Contract version | Unversioned single-shape current implementation reality. Add a version only if a second supported payload shape is introduced. |

### 2.2 Naming-owned responsibilities

Naming owns:

- filename parsing;
- semantic-name interpretation;
- semantic-family interpretation;
- the Naming bridge output payload;
- Naming bridge ambiguity/confidence limitations, including ambiguity and split-family flags;
- Naming registry value authority.

Naming bridge output is provider-owned evidence. It is not Tree policy and does not transfer naming interpretation ownership to Tree.

### 2.3 Tree-owned responsibilities

Tree owns:

- consumer behavior at the `namingSemanticFamilyBridge` seam;
- placement interpretation;
- semantic-home and structural-home reasoning;
- folder-kind reasoning;
- Tree findings;
- Tree severity;
- Tree summary meaning.

Tree may use Naming bridge evidence to inform Tree-owned semantic-home, placement, and family-spread advisories. Tree remains responsible for deciding what placement evidence means in Tree reports.

### 2.4 No silent re-derivation rule

Tree must not silently re-derive Naming-owned semantic-family meaning when the Naming bridge is absent or incomplete.

Current implementation reality:

- The runner stages Naming before Tree when Tree is selected and passes the projected Naming semantic-family bridge to Tree.
- Tree normalizes Naming observations and drops incomplete observations that lack required Naming-owned fields.
- Tree can derive Tree-owned placement records from complete Naming bridge evidence.
- Tree does not emit Naming validity findings.
- Tree-owned placement findings and summaries remain Tree-owned report semantics.

Boundary examples:

| Input condition | Required consumer behavior |
| --- | --- |
| Complete Naming bridge observation | Tree may consume `semanticName`, `familyRoot`, `semanticFamily`, ambiguity flags, and path evidence for Tree-owned placement reasoning. |
| Missing `semanticFamily` | Tree must not infer it from `semanticName`, filename, path, or role suffix. |
| Missing bridge payload | Tree must continue Tree-owned checks that do not require Naming bridge evidence and must not synthesize a replacement Naming bridge. |
| Ambiguity-flagged Naming evidence | Tree may account for the limitation, but must not upgrade ambiguous evidence into unqualified Naming truth. |

## 3. Addressing -> Tree Bridge Contract

### 3.1 Current contract identity

| Field | Current value |
| --- | --- |
| Provider/layer id | `structural-addressing` / Addressing |
| Consumer id | `tree-structure-advisor` |
| Bridge output id | `addressedTreeSnapshot` for the tree-codebase profile; Tree-local current implementation reality uses `structuralAddressSnapshot` as a prepared addressed evidence snapshot. |
| Bridge input id | `addressedOccurrenceRecords` where Tree evidence preparers consume addressed records. |
| Runtime staging owner | Addressing get-tree host for the standalone addressed tree snapshot utility; Tree direct wiring currently prepares Tree-local structural address evidence before Tree-owned reasoning. |
| Contract version | Unversioned single-shape current implementation reality. Add a version only if multiple addressed snapshot payload shapes must be supported. |

### 3.2 Addressing-owned or Addressing-expected responsibilities

Addressing owns or is expected to own:

- shared address grammar;
- address profiles;
- marker strategies;
- addressed snapshot contracts;
- domain adapters;
- bridge outputs;
- pre-reasoning structural evidence.

Addressing prepares deterministic addressed evidence. Addressing does not own Tree placement interpretation, Tree findings, Tree severity, or Tree summary meaning.

### 3.3 Tree-owned responsibilities

Tree owns:

- addressed evidence consumption;
- folder-kind interpretation;
- structural-home interpretation;
- semantic-home interpretation;
- placement reasoning;
- Tree findings;
- Tree severity;
- Tree summary meaning.

Tree may consume addressed evidence, but Addressing does not determine whether a folder is a structural home, semantic home, folder kind, placement violation, advisory, or summary bucket.

### 3.4 Current Addressing classification

Within current implementation reality, Addressing has a current hybrid shared validator layer plus bridge-provider classification.

Addressing is:

- a shared structural-address grammar/profile/marker layer;
- a bridge provider for addressed tree snapshots and pre-reasoning structural evidence;
- not pure suite-core;
- not purely Tree-owned;
- not currently a standalone runnable validator slice;
- not currently registered as a runner-visible validator slice.

This current non-runnable bridge-provider classification preserves the staged implementation path: any future Addressing runtime handoff or extraction requires a scoped issue that preserves report behavior, Tree ownership of placement reasoning, and existing package/bin expectations.

### 3.5 No Tree placement transfer rule

Addressing output must remain neutral addressed evidence unless a future contract explicitly scopes additional provider semantics.

Current implementation reality:

- Addressing tree-codebase output identifies a snapshot output id, profile id, domain prefix, source namespace, scope, target, and addressed occurrence records.
- Tree-local structural address snapshot output provides occurrence records with address paths and parent address paths.
- Addressed records must not include Tree findings, severities, summary buckets, placement confidence, structural-home policy decisions, semantic-home policy decisions, or folder-kind policy decisions as provider-owned truth.
- Tree evidence preparers and Tree runtime remain the owner of Tree placement interpretation and findings.

Boundary examples:

| Input condition | Required consumer/provider behavior |
| --- | --- |
| Addressing provides addressed occurrence records | Tree may consume address paths and occurrence shape as structural evidence. |
| Addressing output lacks Tree policy fields | Tree must derive Tree-owned placement interpretation through Tree-owned registries and evidence preparers. |
| Tree prepares local structural address evidence | The local preparation remains a current implementation reality bridge seam, not proof that Addressing is pure Tree-owned or suite-core. |
| Addressing get-tree host exists | The host remains a utility/bridge surface, not a `validate:addressing` runner slice or package bin. |

## 4. Registry Metadata Expectations

Current runner-visible registry metadata declares Naming -> Tree:

- `naming.metadata.bridge.provides[].id = naming-semantic-family-bridge`;
- `naming.metadata.bridge.provides[].consumerValidatorIds = [tree-structure-advisor]`;
- `tree-structure-advisor.metadata.bridge.consumes[].id = naming-semantic-family-bridge`;
- `tree-structure-advisor.metadata.bridge.consumes[].providerValidatorId = naming`;
- both sides are staged by `validator-runner`.

Current registry metadata does not register Addressing as a validator slice. That absence is intentional current implementation reality for this bridge-contract task because Addressing has a current hybrid shared validator layer plus bridge-provider classification and is not currently a standalone runnable validator slice.

Under the staged implementation path, add registry metadata before any future change that makes Addressing runner-visible:

1. docs/spec alignment;
2. data-only registry payloads;
3. registry shape tests;
4. loader compatibility bridges;
5. runtime behavior migration;
6. extraction preparation.

## 5. Test Expectations

Focused bridge-contract tests should preserve these facts:

- Tree consumes Naming bridge evidence when complete.
- Tree drops incomplete Naming bridge observations rather than re-deriving Naming-owned semantic-family meaning.
- Tree keeps Naming bridge evidence separate from Tree placement findings and does not emit Naming findings.
- Tree keeps structural-home and semantic-home placement reasoning distinct.
- Addressing and Tree addressed snapshots remain neutral evidence envelopes without Tree findings, severity, placement confidence, folder-kind policy, structural-home policy, or semantic-home policy fields.
- Registry tests preserve that Naming -> Tree is the only current runner-visible bridge and that Addressing remains unregistered under the current non-runnable bridge-provider classification.
