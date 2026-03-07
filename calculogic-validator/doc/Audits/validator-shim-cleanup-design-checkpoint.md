# Validator shim cleanup — design checkpoint (pre-pass-3 compat policy)

## 1. Purpose

This checkpoint defines the compatibility policy decision for the five remaining validator shim-debt files before any cleanup pass 3 implementation work.

Context from prior cleanup work:

- pass 1 canonicalized internal imports and left test-referenced shims in place
- pass 2 removed ten compat-only shim files
- five shim-debt files remain because `test/core-compat-shims.test.mjs` intentionally verifies shim-to-canonical API parity

This document answers whether those five remaining paths still represent a real compatibility contract or mostly transition inertia.

## 2. Current remaining shim set

Remaining shim-debt files and current canonical targets:

1. `src/validator-runner.logic.mjs` → `src/core/validator-runner.logic.mjs`
2. `src/validator-registry.knowledge.mjs` → `src/core/validator-registry.knowledge.mjs`
3. `src/validator-scopes.runtime.mjs` → `src/core/validator-scopes.runtime.mjs`
4. `src/tree-structure-advisor.host.mjs` → `tree/src/tree-structure-advisor.host.mjs`
5. `src/tree-structure-advisor.logic.mjs` → `tree/src/tree-structure-advisor.logic.mjs`

All five are single-line `export * from ...` forwarders with no independent runtime behavior.

Boundary and policy observations relevant to these paths:

- Canonical implementation ownership for runner/registry/scopes is already under `src/core/**`.
- Canonical tree host ownership boundary is already under `tree/src/tree-structure-advisor.host.mjs`.
- Public package exports currently expose `./runner`, `./registry`, and `./scopes` using the root shim files as export targets (subpath contract is public, concrete internal file target is implementation detail).
- README currently includes an explicit compatibility note for legacy root tree advisor paths (`src/tree-structure-advisor.host.mjs`, `src/tree-structure-advisor.logic.mjs`).

## 3. Current compat-parity test behavior

`test/core-compat-shims.test.mjs` currently does the following for each of the five shim pairs:

- imports the canonical module and the root legacy shim module
- asserts both sides expose the expected function symbol
- asserts strict function identity equality (shim export reference is the exact same function object)

Interpretation:

- The test is not validating business behavior; it validates export-forwarding compatibility shape.
- For runner/registry/scopes, this largely behaves as transition inertia protection after ownership moved to `src/core/**`.
- For root tree host/logic shims, the test currently aligns with an explicit documented compatibility statement in README.

Therefore, the existing test is a mixed signal: partly policy enforcement (tree legacy note) and partly legacy inertia (core-root forwarders).

## 4. Option analysis

| Option | Keep remaining shims? | Keep compat-parity test? | Risk | Cleanup speed | Recommendation |
|---|---|---|---|---|---|
| A — Temporary full compat contract | Keep all 5 temporarily | Keep full parity test for all 5 | Low immediate break risk, but prolongs debt and blurs canonical ownership | Slow | Not preferred |
| B — End compat contract now | Remove all 5 next pass | Retire/replace full parity test | Fastest debt removal, but higher break risk vs currently documented tree legacy support | Fast | Not preferred |
| C — Split set by actual compatibility value | Keep only subset with meaningful compat promise | Keep parity only for retained subset | Balanced risk; clarifies policy and reduces debt | Medium-fast | **Preferred** |

### Option A — Keep a small temporary compat contract (all 5)

Benefits:

- minimal disruption and no immediate path-break risk for any unknown deep import users
- preserves existing test setup with zero redesign

Risks:

- extends a broad compatibility promise without evidence that all five paths still matter
- keeps canonical ownership less obvious (root and canonical paths both "valid")
- makes future extraction/cleanup harder by preserving duplicate surface area

Cleanup impact:

- pass 3 becomes mostly deferral; real debt remains

Public/legacy expectation impact:

- silently preserves all five as quasi-supported legacy paths

Test strategy impact:

- keep current test as-is, but it continues validating inertia-heavy surfaces

### Option B — End compat contract now (all 5)

Benefits:

- strongest cleanup outcome and clearest ownership boundaries immediately
- removes shim maintenance and test overhead in one pass

Risks:

- conflicts with current README compatibility note for root tree paths unless coordinated as explicit breaking-policy update
- may surprise external/internal scripts relying on root tree legacy imports

Cleanup impact:

- fastest path to zero remaining shim debt

Public/legacy expectation impact:

- decisively ends legacy compatibility for all five paths

Test strategy impact:

- retire full parity test and replace with canonical module contract tests only

### Option C — Split the set (policy-driven)

Proposed split basis:

- **End compat contract for the three core-root shim paths now**
  - `src/validator-runner.logic.mjs`
  - `src/validator-registry.knowledge.mjs`
  - `src/validator-scopes.runtime.mjs`
- **Keep temporary compat contract for the two root tree shim paths for one additional bounded cycle**
  - `src/tree-structure-advisor.host.mjs`
  - `src/tree-structure-advisor.logic.mjs`

Benefits:

- aligns compatibility with actual policy signals rather than blanket inertia
- removes majority of remaining debt while honoring explicit current tree legacy note
- preserves low-risk incremental cleanup sequencing

Risks:

- requires test split/refactor so parity checks only cover retained shims
- requires explicit sunset wording to avoid indefinite retention of tree pair

Cleanup impact:

- substantial debt reduction in pass 3 without forcing abrupt policy reversal

Public/legacy expectation impact:

- narrows compatibility promise to a clearly documented temporary tree legacy bridge
- clarifies that canonical owned paths remain `src/core/**` and `tree/src/**`

Test strategy impact:

- keep a reduced compat-parity test only for retained tree shims
- replace removed-core-shim parity checks with canonical module coverage (no legacy pairing required)

## 5. Recommendation

**Recommended option: Option C (split the set).**

Why this is the best fit now:

1. It improves ownership clarity by removing three root-core forwarders that no longer carry an explicit independent compatibility rationale.
2. It preserves low-risk incrementalism by temporarily retaining the two tree root shims that currently have explicit compatibility wording in README.
3. It avoids over-promising compatibility where policy intent is weak (core-root shims) while avoiding abrupt breakage where policy intent is currently explicit (tree-root shims).
4. It keeps extraction paths obvious: canonical implementations remain in `src/core/**` and `tree/src/**`, and temporary legacy bridges are tightly scoped.

Policy statement (post-checkpoint target):

- `src/core/**` and `tree/src/**` are canonical_source internal module ownership paths.
- Root-level shim files are not a blanket compatibility surface.
- Only explicitly documented temporary legacy paths should retain parity contracts, with a removal target declared in the next cleanup pass documentation.

## 6. Proposed next pass (if recommendation is accepted)

Planned pass 3 actions:

1. **Core-root shim contract end**
   - remove `src/validator-runner.logic.mjs`, `src/validator-registry.knowledge.mjs`, `src/validator-scopes.runtime.mjs`
   - update package export targets for `./runner`, `./registry`, `./scopes` directly to `src/core/**` canonical modules (preserving subpath API while removing shim files)

2. **Compat test strategy update**
   - replace current all-five parity test with a narrowed parity test covering only retained tree legacy shims
   - ensure canonical module tests remain for runner/registry/scopes behavior independent of shim parity

3. **Tree legacy compatibility scope tightening**
   - keep `src/tree-structure-advisor.host.mjs` and `src/tree-structure-advisor.logic.mjs` temporarily
   - document explicit sunset criteria (for example: one pass or one release window)
   - maintain parity assertions for these two only until sunset is reached

4. **Documentation alignment**
   - update cleanup pass 3 audit doc with explicit policy language distinguishing temporary legacy compatibility from canonical ownership
   - keep public boundary carveouts unchanged (`src/index.mjs`, `naming/src/naming-validator.host.mjs`, `tree/src/tree-structure-advisor.host.mjs`)

Net expected result of pass 3 under this recommendation:

- remaining shim debt reduced from 5 to 2
- compatibility promise becomes explicit and narrow
- canonical ownership boundaries become clearer without abrupt policy break for currently documented tree legacy paths
