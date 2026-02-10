# Doc Engine Standards Summary

This summary applies CCPP, CSCS, General NL Skeletons, and NL-First Workflow to doc-engine work in the Interface repository.

## CCPP requirements (mandatory)
1. Every TS/TSX/CSS concern file includes a file header with:
   - Concern label
   - Source NL path
   - Responsibility and invariants
2. Every concern section uses a section header in NL order.
3. Every Container/Subcontainer/Primitive has an atomic comment with NL section number.
4. Decision notes and TODOs follow CCPP formatting.
5. Provenance blocks are required when external references influence implementation decisions.

## CSCS requirements (mandatory)
- Build: drawer shell structure and anchors
- BuildStyle: drawer visual layer
- Logic: provider registry, resolver orchestration, open/close state
- Knowledge: content catalogs, content schemas, concept mappings
- Results: diagnostics panels, instrumentation readouts

## General NL Skeleton requirements
- A dedicated NL config must exist for each doc-engine config before structural implementation.
- NL hierarchy should be mirrored in code comments.
- New structural primitives must be added to NL first.

## NL-First workflow requirements
1. Draft/update NL skeleton.
2. Implement/adjust concern files.
3. Mirror NL numbering in CCPP comments.
4. Validate comments, order, and concern boundaries before merge.
