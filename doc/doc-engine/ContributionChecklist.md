# Doc Engine Contribution Checklist

Use this checklist on every doc-engine PR in the Interface repository.

## Standards gates
- [ ] CCPP checked against `doc/CCPP.md`
- [ ] CSCS checked against `doc/CSCS.md`
- [ ] General NL Skeleton alignment checked against `doc/General-NL-Skeletons.md`
- [ ] NL-First sequence followed from `doc/NL-First-Workflow.md`

## NL-first gates
- [ ] NL doc added/updated first (`doc/nl-doc-engine/...`)
- [ ] NL section numbers and code comments are synchronized
- [ ] No structural code added without NL section coverage

## CCPP comment gates
- [ ] File headers present in each concern file
- [ ] Section headers present in NL order
- [ ] Atomic comments above each Container/Subcontainer/Primitive
- [ ] TODO entries include owner + date
- [ ] Decision notes include context/choice/consequence

## Architecture gates
- [ ] Uses normalized `ContentNode` shape
- [ ] Uses provider registry/resolver interfaces (no hard-coded single provider)
- [ ] `contentId` and `anchorId` are stable and deterministic
- [ ] Namespace routing is respected (`docs:*`, future providers)

## Accessibility gates (drawer)
- [ ] `role="dialog"` + `aria-modal="true"`
- [ ] Escape closes drawer
- [ ] Focus returns to trigger on close
- [ ] Anchor navigation works when `anchorId` provided
