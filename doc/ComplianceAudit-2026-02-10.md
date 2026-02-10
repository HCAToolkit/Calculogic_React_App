# Compliance Audit — CSCS / CCPP / General NL Skeletons / NL-First

Date: 2026-02-10  
Scope: recently changed configurations/shells identified from git history and mapped to current project paths.

## Inputs reviewed
- `doc/CSCS.md`
- `doc/CCPP.md`
- `doc/General-NL-Skeletons.md`
- `doc/NL-First-Workflow.md`
- `doc/nl-config/cfg-appFrame.md`
- `doc/nl-config/cfg-buildSurface.md`
- `doc/nl-shell/shell-globalHeader.md`
- `doc/nl-shell/shell-spaHost.md`
- Related concern files under `src/`

## Changed configurations/shells identified
1. `cfg-appFrame`
2. `cfg-buildSurface`
3. `shell-globalHeader`
4. `shell-spaHost`

---

## 1) cfg-appFrame

### Violations found
- **Build (NL → Code numbering mismatch)**
  - File: `src/App.tsx`
  - NL sections affected: `[3.1.1]`, `[3.3.1]`, `[3.3.2]`
  - Code uses `[3.1]`, `[3.2]`, `[3.3]` and does not mirror NL atomic numbering.
- **Build (NL contract mismatch)**
  - File: `src/App.tsx`
  - NL section affected: `[3.3.1] Theme Toggle Control`
  - `aria-pressed` contract declared in NL is missing in code.
- **Knowledge purity (NL → Code missing concern file usage)**
  - Files: `src/App.tsx`, `doc/nl-config/cfg-appFrame.md`
  - NL sections affected: `[6.2.1]`, `[6.2.2]`, `§6.3`
  - Toggle copy/icon descriptors are inlined in Build instead of imported from Knowledge.
- **Logic (NL → Code numbering mismatch)**
  - File: `src/App.logic.ts`
  - NL sections affected: `[5.2.1]`, `[5.2.2]`, `[5.2.3]`
  - Code comments use `[5.1]`, `[5.2]`, `[5.3]`.
- **BuildStyle (NL → Code numbering mismatch)**
  - File: `src/App.css`
  - NL sections affected: `[4.1.1]`, `[4.2.1]`, `[4.2.2]`
  - Code comments use flattened numbering and do not mirror NL atomic ids.

### Minimal fix required
1. Update `doc/nl-config/cfg-appFrame.md` only if contracts are intentionally changed.
2. Add `src/App.knowledge.ts` for toggle copy/icon descriptors.
3. Update `src/App.tsx` to import Knowledge constants and add `aria-pressed` on toggle.
4. Renumber CCPP atomic comments in `src/App.tsx`, `src/App.logic.ts`, `src/App.css` to exact NL ids.

---

## 2) cfg-buildSurface

### Violations found
- **Build (NL → Code missing declared subcontainer)**
  - File: `src/tabs/build/BuildSurface.build.tsx`
  - NL section affected: `[3.2.2] Header Chrome`
  - NL declares Header Chrome, but Build file renders no header chrome node.
- **BuildStyle attachment leak (CSCS concern dependency)**
  - File: `src/tabs/build/BuildSurface.view.css`
  - NL/Code sections affected: `[4.2.2]..[4.2.7]` targeting `builder-header`, `builder-tabs`, publish CTA.
  - Build concern does not emit those anchors, so BuildStyle contains orphan selectors not attached to Build structure.
- **Knowledge (NL → Code missing declared primitives)**
  - Files: `src/tabs/build/anchors.ts`, `src/tabs/build/BuildSurface.logic.ts`, `src/tabs/build/BuildSurface.build.tsx`
  - NL sections affected: `[6.2.1] Section Labels`, `[6.2.2] Grip Aria Labels`, `[6.2.3] Placeholder Copy`
  - Section labels/aria labels/placeholders are in Logic/Build inline strings instead of Knowledge module.

### Minimal fix required
1. Update `doc/nl-config/cfg-buildSurface.md` first if Header Chrome is intentionally deferred/removed.
2. Either:
   - implement `[3.2.2] Header Chrome` in Build and keep matching BuildStyle selectors, or
   - remove/renumber header-related BuildStyle atoms from NL and CSS.
3. Add Knowledge exports (labels, aria copy, placeholder copy) and import into Build/Logic.
4. Renumber atomic comments to exact NL ids where mismatched.

---

## 3) shell-globalHeader

### Violations found
- **Build (Code → NL drift)**
  - File: `src/components/GlobalHeaderShell/GlobalHeaderShell.build.tsx`
  - NL sections affected: `3.x`
  - Code includes mode menus (`BuildModeMenu`, `ResultsModeMenu`, `ModeMenuItem`) that are not represented in NL skeleton atoms/subcontainers.
- **Build (NL → Code missing declared primitive)**
  - File: `src/components/GlobalHeaderShell/GlobalHeaderShell.build.tsx`
  - NL section affected: `[3.3.7] Tab Tooltip Portal`
  - Declared primitive is not present as explicit structure.
- **Logic (Code → NL drift)**
  - File: `src/components/GlobalHeaderShell/GlobalHeaderShell.logic.ts`
  - NL sections affected: `[5.2.1]..[5.2.10]`
  - Code includes doc state/open/close and tab-mode selection flows not reflected by NL primitive list.
- **Knowledge (Code → NL drift)**
  - File: `src/components/GlobalHeaderShell/GlobalHeaderShell.knowledge.ts`
  - NL sections affected: `6.x`
  - Extensive doc definition catalog and mode metadata exceed current NL declarations.
- **ResultsStyle (NL → Code numbering mismatch)**
  - File: `src/components/GlobalHeaderShell/GlobalHeaderShell.results.css`
  - NL section affected: `[8.1.1]`
  - Code defines an additional `[8.2] Live Region Anchor` not represented in NL.

### Minimal fix required
1. Update `doc/nl-shell/shell-globalHeader.md` first to include mode menus, doc resolution state, and live region style primitive.
2. Keep concern purity by ensuring new knowledge/data structures remain in Knowledge and only consumed by Build/Logic.
3. Align CCPP atomic numbering in all concern files to updated NL numbering.

---

## 4) shell-spaHost

### Violations found
- **CCPP file-header format violation**
  - Files: `src/main.tsx`, `src/index.css`
  - Current headers use abbreviated `CCPP:` style, not required file-header fields from CCPP.
- **Section/atomic comment format mismatch**
  - Files: `src/main.tsx`, `src/index.css`
  - CCPP expects full section headers and atomic comment format with NL section ids.
- **Assembly path drift (NL → Code)**
  - NL references `src/shells/spaHost/...`; implementation currently uses `src/main.tsx` + `src/index.css`.

### Minimal fix required
1. Update `doc/nl-shell/shell-spaHost.md` assembly section to actual paths (or move files to NL paths).
2. Rewrite `src/main.tsx` and `src/index.css` comment headers/sections/atomics to full CCPP format.
3. Preserve shell purity (Build mount primitive only; BuildStyle global resets only).

---

## Single Alignment PR change set (order enforced)

### Step A — NL-first updates
1. Update `doc/nl-config/cfg-appFrame.md` (knowledge extraction + exact numbering expectations).
2. Update `doc/nl-config/cfg-buildSurface.md` (header chrome presence decision + BuildStyle attachments).
3. Update `doc/nl-shell/shell-globalHeader.md` (mode menu, doc state/resolution, live-region styling primitives).
4. Update `doc/nl-shell/shell-spaHost.md` (actual assembly paths and comment expectations).

### Step B — Concern file alignment
1. `cfg-appFrame`: `src/App.tsx`, `src/App.logic.ts`, `src/App.css`, add `src/App.knowledge.ts`.
2. `cfg-buildSurface`: `src/tabs/build/BuildSurface.build.tsx`, `src/tabs/build/BuildSurface.view.css`, `src/tabs/build/BuildSurface.logic.ts`, `src/tabs/build/anchors.ts` (or new knowledge file).
3. `shell-globalHeader`: all concern files under `src/components/GlobalHeaderShell/`.
4. `shell-spaHost`: `src/main.tsx`, `src/index.css` (or move to shell path and update imports).

### Step C — Verification gates
- NL → Code section-by-section parity check.
- Code → NL drift check (no undeclared atoms).
- CSCS dependency/purity check (Build anchors as attach sources; no upward concern dependencies).
- CCPP header/section/atomic format check.
