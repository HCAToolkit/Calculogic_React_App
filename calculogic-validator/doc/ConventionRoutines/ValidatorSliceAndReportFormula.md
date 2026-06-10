# Validator Slice and Report Formula

Purpose: define the repeatable formula future validator slices use to integrate with suite-core, produce reports, declare bridge relationships, separate evidence from policy, use validator registry metadata, and satisfy command/docs/test expectations.

Authority: bounded normative supporting spec. Defer primary runtime behavior to `ValidatorSuite-Contracts-And-Modes.md`, slice-owned canonical specs, and current runtime truth.

Provenance: informed by completed candidate-policy and repeatable validator-slice infrastructure hardening work.

Non-goals for this formula slice:

- Do not audit Naming, Tree, or Addressing in detail.
- Do not rewrite runner dispatch, report shapes, report ids/descriptions, severity behavior, exit-code behavior, package scripts, or package bins.
- Do not move Naming interpretation, Tree interpretation, or Addressing semantics into suite-core.
- Do not extract Addressing runtime behavior, create a universal plugin architecture, create a generic shared bucket, or implement Lexical / Coherence.
- Do not treat planning/living-doc context as automatic runtime truth.

## 1. Operating Rule

Every validator slice should be boring to add:

1. Declare stable identity and integration metadata.
2. Reuse suite-core for repo-agnostic mechanics.
3. Keep domain interpretation in the owning slice or bridge provider.
4. Return the common base result shape.
5. Let suite-core wrap reports and derive exit codes.
6. Prove bridge handoffs explicitly when consuming another slice's prepared output.
7. Document commands, capture profile, and tests without changing runtime behavior unless the implementation issue asks for it.

## 2. Validator Slice Integration Formula

Every slice/layer MUST declare or intentionally omit each item below.

| Integration item | Formula requirement |
| --- | --- |
| Slice id | Declare a stable slice id. Use it consistently in registry metadata, command docs, report docs, tests, and bridge contracts. |
| Registry entry | Add a validator registry entry only when the layer is runnable through the suite runner or intentionally represented for repeatable integration metadata. |
| Registry metadata | Add metadata for repeatable integration questions that would otherwise become hardcoded or drift-prone. |
| Report identity | Declare report `entryId`, `validatorId`, description, mode, and profile id through registry metadata when the slice is runner-visible. |
| Command identity | Document repo-local npm script and direct script path when they exist; intentionally defer when the layer is runner-only or bridge-provider-only. |
| Runner inclusion | Declare whether the slice is included by default in `validate:all`, selected by registry id, runner-only, or omitted from runner dispatch. |
| Runnable status | Classify as `direct runnable`, `runner-only`, `bridge provider`, or a hybrid status. Do not imply package-bin availability unless it exists. |
| Package-bin expectation | Record expected bin name and availability. This formula does not recommend package/bin changes by itself. |
| Report-capture profile | Declare capture profile id, script pattern, prefix pattern, and supported scopes when report capture is expected. |
| Compatibility metadata | Record behavior-preserving metadata, registry-selection compatibility, and report-shape ownership expectations. |

Checklist for a new slice:

- [ ] Stable slice id exists.
- [ ] Registry entry exists or omission is intentional and documented.
- [ ] Registry metadata covers report, command, runner, bridge, capture, package-bin, and compatibility status.
- [ ] Report identity comes from stable metadata rather than ad hoc wrapper literals.
- [ ] Direct runnable / runner-only / bridge-provider status is explicit.
- [ ] Package-bin status is explicit without creating bins in a docs-only slice.
- [ ] Report-capture profile exists or is intentionally deferred.
- [ ] Compatibility metadata preserves current runtime truth.

## 3. Validator Suite-Core Usage Formula

Suite-core owns repo-agnostic mechanics. Slices consume those mechanics and MUST NOT reimplement them without explicit justification in the owning issue or PR.

Use suite-core for:

- Scope profiles and scope-profile lookup.
- Target resolution, path normalization, and scoped-target filtering.
- Scoped snapshot input packaging.
- Candidate-policy normalization and candidate-path collection.
- Runner/report wrapping mechanics.
- Report metadata helpers, including tool version and config digest helpers.
- Exit-code derivation mechanics.
- Validator registry metadata lookup and runner selection.
- Report-capture mechanics and capture-profile alignment.

Slice-owned code may still adapt suite-core output into the slice's prepared runtime shape. That adapter must preserve the suite-core mechanics instead of replacing them.

Checklist:

- [ ] Scope/target/path collection uses suite-core helpers.
- [ ] Candidate policy uses suite-core helper contracts where applicable.
- [ ] Runner-visible reports are wrapped by suite-core.
- [ ] Exit codes are derived through suite-core policy mechanics.
- [ ] Registry metadata is consumed rather than duplicated in command/report code.
- [ ] Any local reimplementation has an explicit ownership justification.

## 4. Validator Slice-Owned Interpretation Formula

Rule: slices own domain meaning; suite-core owns reusable mechanics.

Examples:

- Naming owns filename parsing, semantic-name interpretation, semantic-family interpretation, Naming registries, Naming finding policy, Naming summary meaning, and `reportableExtensions` / `reportableRootFiles` value authority for current runtime truth.
- Tree owns folder-kind interpretation, structural-home reasoning, semantic-home reasoning, placement evidence, whole-placement confidence, Tree registries, Tree finding policy, and Tree summary meaning.
- Addressing is initially a hybrid shared validator layer plus bridge provider: it prepares deterministic addressed evidence, but it is not pure suite-core, not purely Tree-owned, and not a standalone runnable validator slice until it has independent report value.

Addressing boundary for now:

- Addressing prepares deterministic addressed evidence.
- Tree consumes addressed evidence and owns placement interpretation.
- Naming owns semantic-name and semantic-family interpretation.
- Suite-core should not own Addressing semantics.
- Addressing should not become a standalone runnable validator slice until it has independent report value.

Checklist:

- [ ] Domain interpretation remains in the owning slice or provider layer.
- [ ] Suite-core helpers do not infer Naming, Tree, or Addressing semantics.
- [ ] Registry metadata does not become slice interpretation policy.
- [ ] Bridge consumers consume prepared output instead of re-deriving provider meaning.

## 5. Validator Report Behavior Formula

Every runner-visible slice SHOULD return a common base runtime result shape:

- `scope`
- `totalFilesScanned`
- `findings`
- `summary`
- optional `meta`

Report behavior requirements:

| Report area | Formula requirement |
| --- | --- |
| Findings | Slice owns finding policy, severity assignment, classification, messages, and rule references. |
| Summary | Slice owns summary meaning and summary buckets/counts. |
| Counts | Slice should expose deterministic counts through `summary.counts` when available. |
| Meta | Runtime normalized views and filter metadata may appear under `meta`; meta must not become competing policy truth. |
| Report wrapping | Suite-core owns the runner report envelope and per-validator report-entry wrapping. |
| Report id/description | Registry metadata should be the stable input for report identity. Existing wrappers may preserve current runtime truth until migrated. |
| Severity behavior | Slice-owned finding policy controls severity; this formula does not change severity behavior. |
| Exit-code derivation | Suite-core derives exit code from findings and exit policy. Slices do not own suite exit-code mechanics. |
| Stdout/stderr | CLI wrappers should keep deterministic JSON/report output behavior and route non-report diagnostics intentionally. |
| Report capture | Capture commands should use the slice's report-capture profile and supported scopes. |
| Ordering | Slices should sort findings, paths, targets, evidence records, and summary buckets deterministically. |
| Path normalization | Use suite-core path normalization where applicable; slice output should use stable repo-relative paths. |
| Scope/target metadata | Scope and target metadata should reflect suite-core scoped input and filters. |

Checklist:

- [ ] Base runtime result shape is present.
- [ ] Slice summary meaning remains slice-owned.
- [ ] Suite-core wrapping remains the report envelope owner.
- [ ] Exit-code derivation uses suite-core mechanics.
- [ ] Metadata is deterministic and not competing policy truth.
- [ ] Scope, target, and path fields are normalized and stable.

## 6. Validator Bridge / Cross-Slice Consumption Formula

Bridge rule: providers prepare output; consumers consume it. Consumers MUST NOT silently re-derive provider-owned meaning.

Bridge requirements:

- Provider-owned prepared output with a named bridge output id.
- Consumer-owned consumption with a named bridge input id.
- Explicit bridge contract and, when needed, contract version.
- Registry metadata declaring `provides` and `consumes` relationships.
- Runtime handoff owned by the runner or another explicit orchestrator.
- Ambiguity/confidence limitations documented in the bridge contract or output shape.
- Tests proving the consumer uses the prepared bridge input and does not silently re-derive provider semantics.

Precedent: Naming prepares semantic-family bridge output. Tree consumes that prepared output for semantic-home evidence while retaining Tree-owned placement interpretation.

Structural Addressing direction: Addressing should later provide addressed snapshots through an explicit provider/bridge boundary. Tree should consume addressed snapshots and keep placement interpretation in Tree.

Checklist:

- [ ] Bridge output id is stable.
- [ ] Bridge input id is stable.
- [ ] Provider and consumer ids are declared in registry metadata when runner-visible.
- [ ] Runtime handoff is explicit.
- [ ] Tests prove no silent re-derivation.
- [ ] Ambiguity/confidence limits are documented.

## 7. Validator Evidence vs Policy Formula

Keep these categories separate:

| Category | Meaning | Formula rule |
| --- | --- | --- |
| Registry policy truth | Maintained policy payloads and normalized policy views. | May drive runtime interpretation only inside the owning domain. |
| Runtime normalized views | Loader/converter/runtime shapes derived from policy payloads. | Consume policy truth; do not become competing policy truth. |
| Observed evidence | Facts observed from repository files, paths, names, folders, or current reports. | May inform future registry policy; must not become registry policy automatically. |
| Generated evidence | Deterministic generated artifacts such as future evidence manifests. | Must identify source and generation boundary; must not silently update policy. |
| Slice-owned interpretation | Domain meaning assigned by Naming, Tree, Addressing, or another slice. | Must stay in the owning slice/provider. |
| Report findings | User-facing diagnostics produced from policy and evidence. | Must remain deterministic and traceable to slice-owned policy. |
| Developer-confirmed future policy | Human-reviewed policy intended for future registry payloads. | Requires explicit registry update work before becoming policy truth. |

Examples:

- Naming semantic-family observations can support future policy decisions, but Naming registries remain the policy authority.
- Tree structural-home and semantic-home evidence can support placement reasoning, but Tree registries and Tree finding policy remain policy authority.
- Addressing addressed snapshots provide deterministic structural evidence, not Tree placement policy.
- Future Lexical generated evidence manifests may inform policy proposals, but generated evidence must not auto-promote into registry truth.

Checklist:

- [ ] Evidence source is explicit.
- [ ] Generated/observed evidence does not mutate registry policy automatically.
- [ ] Runtime normalized views consume registry truth rather than replace it.
- [ ] Findings trace to slice-owned interpretation and policy.
- [ ] Future policy is developer-confirmed before registry update work.

## 8. Validator Registry / Metadata Formula

Add validator-registry metadata when it answers a repeatable integration question that would otherwise become hardcoded or drift-prone.

Registry metadata MAY describe:

- Slice identity.
- Report identity and capture profile.
- Command identity and package-bin expectation.
- Runner inclusion and selection id.
- Direct runnable / runner-only / bridge-provider status.
- Bridge `provides` / `consumes` relationships.
- Compatibility status and behavior-preserving migration notes.

Registry metadata MUST NOT own:

- Naming filename grammar, semantic-name interpretation, semantic-family interpretation, finding policy, or summary meaning.
- Tree folder-kind interpretation, structural-home reasoning, semantic-home reasoning, placement confidence, finding policy, or summary meaning.
- Addressing grammar/profile/marker/domain-adapter semantics unless Addressing is explicitly the owning provider and the metadata only identifies integration, not interpretation policy.

Checklist:

- [ ] Metadata answers integration questions, not domain-policy questions.
- [ ] Metadata avoids duplicating Naming or Tree semantic policy.
- [ ] Bridge metadata declares relationships without embedding consumer interpretation.
- [ ] Compatibility metadata documents current implementation reality without changing behavior.

## 9. Validator Command / Docs / Test Formula

Every slice should satisfy or intentionally defer this checklist:

- [ ] Npm command pattern documented.
- [ ] Direct script pattern documented.
- [ ] Package-bin expectation documented without creating bins unless scoped.
- [ ] Report-capture command pattern documented.
- [ ] Canonical or supporting docs/spec entry exists.
- [ ] Validator docs index entry exists.
- [ ] Registry metadata tests cover integration fields when metadata changes.
- [ ] Runtime tests cover slice-owned behavior when runtime changes.
- [ ] Report tests cover base shape, findings, summary, counts, meta, path ordering, and deterministic output when report behavior changes.
- [ ] Bridge tests cover provider output, consumer input, handoff, and no silent re-derivation when bridge relationships exist.
- [ ] Scope/target tests cover suite-core compatibility when scope/target behavior changes.
- [ ] Candidate-helper compatibility tests cover helper consumption when candidate collection changes.

Docs-only formula work should run targeted documentation/naming checks and avoid broad runtime verification unless runtime code changes unexpectedly.

## 10. Later Audit Rubric

A later child can classify each slice or layer as:

- `aligned`: follows the formula with no material gap.
- `partially aligned`: follows the formula in some areas but has bounded gaps.
- `intentionally different`: differs for a documented ownership, compatibility, or staged implementation reason.
- `under-hardened`: should follow the formula but lacks metadata, tests, docs, or explicit contracts.
- `deferred`: gap is real but fixing it belongs to a later scoped issue.

Audit questions:

- [ ] Does the slice follow the formula?
- [ ] Is each difference intentional and documented?
- [ ] Is the gap worth fixing now under the ROI model?
- [ ] Is the gap deferred to a staged implementation path?
- [ ] Would fixing the gap require runtime behavior changes?

The later audit should classify Naming, Tree, and Addressing against this rubric without turning this formula doc into a detailed audit.
