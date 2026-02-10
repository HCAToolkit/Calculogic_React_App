# Doc-Engine Contribution Checklist

Use this checklist before opening or approving a doc-engine PR.

## Linked Standards (Required)

- [ ] **CCPP** reviewed and applied: `doc/CCPP.md`
- [ ] **CSCS** reviewed and applied: `doc/CSCS.md`
- [ ] **General NL Skeletons** template/numbering followed: `doc/General-NL-Skeletons.md`
- [ ] **NL-First Workflow** enforced (NL updated before code): `doc/NL-First-Workflow.md`

## NL-First and Ordering

- [ ] NL skeleton exists at `doc/nl-config/cfg-*.md` or `doc/nl-shell/shell-*.md`.
- [ ] NL sections are complete and concern numbering is correct (3–8 mapping).
- [ ] Code/comment ordering mirrors NL top-down ordering.

## CCPP Comment Compliance

- [ ] Exactly one file header exists per concern file and includes Source NL.
- [ ] Section headers are present for each concern section in use.
- [ ] Atomic comments precede every Container/Subcontainer/Primitive block.
- [ ] Atomic comments use the required three-line structure and correct section IDs.
- [ ] TODO comments include owner + date when used.

## CSCS Concern Purity

- [ ] Build files contain structure only.
- [ ] BuildStyle/ResultsStyle files contain style rules only.
- [ ] Logic files contain behavior/state only.
- [ ] Knowledge files contain static content/constants only.
- [ ] Results files contain derived outputs/readouts only.
- [ ] No non-Build concern creates or reorders structure.

## Final Consistency Checks

- [ ] NL numbering and code comment numbering match exactly.
- [ ] Anchors referenced outside Build are defined in Build.
- [ ] Any decisions/todos/provenance notes are minimal and valid per CCPP.
