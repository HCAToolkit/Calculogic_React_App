# cfg-reportCapture

## 0.0 Version

Current implementation target: **V0.2.0**. The report-capture tool itself is supplied by the pinned `@calculogic/report-capture` package from [`HCAToolkit/calculogic-report-capture`](https://github.com/HCAToolkit/calculogic-report-capture), which owns the tool's contract. This document now covers only how this app uses it: its capture presets and the Validator report workflows around them (Refs #713). Tool-owned sections below point to that contract at commit `624f1a3c325ae7d3f6c576829ee9ee672194c0e1`, the same commit this app pins in `package.json`, so they describe the version this checkout actually runs. When the `@calculogic/report-capture` pin changes, update these links to the new commit in the same change.

## 1.0 Purpose

Capture this app's validator runs into timestamped JSON reports under `./.reports`, using the `calculogic-report-capture` command, and define the app-side workflows around those captures (presets, verification, summarization, and report-example regeneration). The wrapper's own behavior is defined by the report-capture contract linked in 0.0.

## 2.0 Inputs and Source of Truth

### 2.1 CLI interface contract

Owned by the tool. See §2.1 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

### 2.2 Default report directory

Owned by the tool. See §2.2 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

### 2.3 Filename contract

Owned by the tool. See §2.3 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

### 2.4 Scope capture presets

Root package scripts provide deterministic capture presets for naming, validate-all, and validate-tree across `repo`, `app`, `docs`, `validator`, and `system` scopes, writing files to repo-local `./.reports/` for safe exclusion from validator walking behavior.

Report-capture also provides validator-internal naming presets that preserve scope taxonomy while adding practical granularity. **As of Calculogic_React_App#716, these are Validator self-development commands that require a live `npm link @calculogic/validator` connection and dispatch through `scripts/run-validator-dev-command.mjs` to the linked standalone checkout** (see `.devcontainer/README.md`); in stable/non-linked mode they exit nonzero with a guard message instead of running. Targets are relative to the linked checkout's own root, not the embedded `calculogic-validator/` tree:

- `report:naming:validator:entry` → `--scope=validator --target bin --target scripts`
- `report:naming:validator:naming` → `--scope=validator --target naming`
- `report:naming:validator:tree` → `--scope=validator --target tree`
- `report:naming:validator:doc` → `--scope=validator --target doc`

(Historical note: before #716, these targeted the embedded `calculogic-validator/bin`, `calculogic-validator/naming`, etc. directly, with no live-link requirement.)

These are convenience scripts only; no additional built-in scope profiles are introduced.

### 2.5 Verifier workflow contract

**As of #716, `report:verify` is also a Validator self-development command**, guarded and dispatched the same way as the presets above - it invokes `report-capture-verify.host.mjs` inside the live-linked standalone checkout (`npm --prefix node_modules/@calculogic/validator run report:verify`), not the repo-local embedded copy. The verifier itself runs naming validation through report-capture for one or more scopes, parses the metadata JSON line, and asserts the generated report file exists in the configured reports directory and contains a full JSON naming report. The linked checkout must have its own dev dependencies installed (`npm ci` in that checkout), because the standalone verifier resolves the `@calculogic/report-capture` dev dependency from there. Without them it exits 1 with a message saying so. (Historical note: before #716, this repo invoked the embedded `calculogic-validator/scripts/report-capture-verify.host.mjs` directly by path.)

### 2.6 Post-capture summarizer contract

`report:summarize` runs the Validator-owned summarizer through the public `calculogic-validator-report-summarize` command of the installed `@calculogic/validator` package (added in HCAToolkit/calculogic-validator#28). It reads the latest captured JSON report per prefix from `./.reports` (or `--dir`), resolved from the directory it is run in, and prints compact per-scope summaries suitable for Codex/PR notes; `--help` lists its options. Unlike 2.4/2.5, it is **not** gated behind a live link: it summarizes this React app's own already-captured reports in both modes. In stable mode the pinned package supplies the summarizer; in live mode the same command resolves through the link to the linked standalone checkout's summarizer, and it still reads this app's `./.reports`. (Historical note: before this migration, `report:summarize` invoked the embedded `calculogic-validator/scripts/report-capture-summarize.host.mjs` directly by path. Refs #713.)

### 2.7 Report-examples workflow contract

**As of Calculogic_React_App#723, `report:examples:validator` is also a Validator self-development command**, guarded and dispatched the same way as 2.4/2.5: `node scripts/run-validator-dev-command.mjs report:examples:validator --` runs the standalone checkout's own `report:examples:validator` npm script (added in HCAToolkit/calculogic-validator#30) inside the live-linked checkout (`npm --prefix node_modules/@calculogic/validator run report:examples:validator`). In stable/non-linked mode it exits nonzero with the guard message and generates nothing.

- **Execution context:** the generator runs in the linked standalone checkout and documents that checkout's Validator. It takes its development root from where its own code lives, not from this app.
- **Fixture destination:** by default it regenerates the linked checkout's own normalized report examples in `test/fixtures/report-examples/` of that checkout. It never writes to this app, to its `node_modules`, or to the embedded `calculogic-validator/` tree. Commit refreshed fixtures in the standalone repository.
- **Argument forwarding:** the app script ends with `--`, so arguments after `npm run report:examples:validator --` are forwarded to the standalone script. `--out-dir=<path>` writes the examples elsewhere. A relative path resolves from the linked checkout, where npm runs the script, so use an absolute path to write outside it.
- **Checkout compatibility:** the dispatcher requires a linked checkout that includes HCAToolkit/calculogic-validator#30. Its `scripts/generate-validator-report-examples.host.mjs` must call `runValidatorReportExamplesCli`, and its `package.json` must define the `report:examples:validator` npm script. An older or only partly updated checkout is rejected before npm runs, with an instruction to update it.

(Historical note: before #723, this repo ran the embedded `calculogic-validator/scripts/generate-validator-report-examples.host.mjs` directly by path, regenerating fixtures inside the embedded tree. Refs #713.)

## 3.0 Build Concern

### 3.1 CLI host assembly

Owned by the tool. See §3.1 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

### 3.2 Spawn contract

Owned by the tool. See §3.2 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

### 3.3 Windows command resolution

Owned by the tool. See §3.3 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

## 4.0 BuildStyle Concern

Not applicable for this CLI feature.

## 5.0 Logic Concern

### 5.1 Timestamp and filename helpers

Owned by the tool. See §5.1 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

### 5.2 Prune logic

Owned by the tool. See §5.2 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

### 5.3 Prune gating logic

Owned by the tool. See §5.3 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

## 6.0 Knowledge Concern

### 6.1 OS cache directory knowledge

Owned by the tool. See §6.1 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

## 7.0 Results Concern

### 7.1 Output stream behavior

Owned by the tool. See §7.1 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

### 7.2 JSON metadata output

Owned by the tool. See §7.2 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

### 7.3 Verifier output summary

The verifier emits one compact success line per scope (`OK naming:<scope> -> <path> (<bytes> bytes, <durationMs> ms)`) and exits non-zero when metadata or report assertions fail.

### 7.4 Summarizer output summary

The summarizer emits a compact block per prefix including latest file metadata, report scope totals, counts, top code counts, and warn samples. It exits non-zero when any requested prefix is missing a report or has invalid JSON.

### 7.5 Report-examples output summary

The generator writes `validate-naming.system.report.example.json` and `validate-all.system.naming.report.example.json` (timestamps, durations, repository root, git SHA and dirty counters normalized) and prints `Wrote 2 report examples to <directory>`. It exits non-zero with a message when generation fails, and exits nonzero from the dispatcher guard in stable mode or against an incompatible linked checkout (2.7).

## 8.0 ResultsStyle Concern

Not applicable for this CLI feature.

## 9.0 Assembly Pattern

Owned by the tool. See §9.0 of the report-capture contract ([`doc/cfg-reportCapture.md`](https://github.com/HCAToolkit/calculogic-report-capture/blob/624f1a3c325ae7d3f6c576829ee9ee672194c0e1/doc/cfg-reportCapture.md) in `HCAToolkit/calculogic-report-capture`).

## 10.0 Implementation Passes

- Pass A: Add helper modules (knowledge + logic + contracts).
- Pass B: Implement host orchestration and command execution.
- Pass C: Add deterministic unit/integration-light tests.
- Pass D: Wire local file dependency for `npx calculogic-report-capture` usage.
- Pass E: Add report-capture verifier script + integration coverage for metadata/report integrity checks.
- Pass F: Add latest-report summarizer script + deterministic tests for newest-file selection and missing-prefix failures.
- Pass G: Replace the embedded `file:calculogic-validator/tools/report-capture` dependency with the pinned standalone `@calculogic/report-capture` package, and move the tool-owned sections of this document to the report-capture repository (Refs #713).
- Pass H: Route `report:examples:validator` through the live-link dispatcher to the standalone checkout's `report:examples:validator` script, with a checkout-compatibility requirement for HCAToolkit/calculogic-validator#30 (Refs #713).
