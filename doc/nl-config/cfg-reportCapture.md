# cfg-reportCapture

## 0.0 Version
Current implementation target: **V0.0.0** (cross-platform CLI wrapper for command output capture).

## 1.0 Purpose
Provide a deterministic command wrapper that captures combined stdout/stderr into timestamped reports while still streaming output live to the terminal.

## 2.0 Inputs and Source of Truth
### 2.1 CLI interface contract
The wrapper accepts pre-command flags (`--dir`, `--keep`, `--no-prune`, `--prefix`, `--warn-on-prune`, `--no-warn-on-prune`, `--json`) followed by a required command after `--`.

### 2.2 Default report directory
When `--dir` is not provided, report output uses an OS-appropriate user cache base:
- Linux: `$XDG_CACHE_HOME` else `~/.cache`
- macOS: `~/Library/Caches`
- Windows: `%LOCALAPPDATA%` else `~/AppData/Local`

Reports live under `<cacheBase>/calculogic-report-capture/reports`.

### 2.3 Filename contract
Report filenames are deterministic and filesystem-safe:
- `<prefix>-YYYY-MM-DD_HH-MM-SS.txt`
- Prefix defaults to `report`
- Timestamp is local time and zero-padded

### 2.4 Scope capture presets
Root package scripts provide deterministic capture presets for naming and validate-all across `repo`, `app`, `docs`, `validator`, and `system` scopes, writing files to repo-local `./.reports/` for safe exclusion from validator walking behavior.

## 3.0 Build Concern
### 3.1 CLI host assembly
Host module parses argv, resolves directory defaults, warns about pending prune deletions, starts capture run, and exits with the wrapped command exit code.

### 3.2 Spawn contract
Child process uses `spawn(command, args, { stdio: ['inherit', 'pipe', 'pipe'] })` and avoids shell mode.

### 3.3 Windows command resolution
When platform is Windows and command is extensionless, resolve via PATH + PATHEXT (`.cmd`, `.exe`, `.bat`, etc.) before spawn.

## 4.0 BuildStyle Concern
Not applicable for this CLI feature.

## 5.0 Logic Concern
### 5.1 Timestamp and filename helpers
Helpers format timestamps and derive safe filenames/prefixes deterministically.

### 5.2 Prune logic
Prune logic matches `${prefix}-*.txt`, sorts by `mtimeMs` descending, keeps newest `N`, and deletes older files.

### 5.3 Prune gating logic
A dedicated helper controls whether pruning is active (`--no-prune` disables).

## 6.0 Knowledge Concern
### 6.1 OS cache directory knowledge
Knowledge module maps current platform and environment variables to the default cache path.

## 7.0 Results Concern
### 7.1 Output stream behavior
Stdout and stderr both stream to terminal and are appended to the same report file.

### 7.2 JSON metadata output
When `--json` is set, emit one compact JSON line to stderr with:
- `path`, `exitCode`, `bytes`, `startedAt`, `endedAt`, `durationMs`, `dir`, `prefix`

## 8.0 ResultsStyle Concern
Not applicable for this CLI feature.

## 9.0 Assembly Pattern
1. Parse options and command split at `--`.
2. Resolve output directory and report filename.
3. Optionally pre-warn if current report count implies post-run pruning.
4. Run child command while teeing output to terminal and report file.
5. Close report file, optionally prune, optionally emit JSON metadata.
6. Exit with child exit code.

## 10.0 Implementation Passes
- Pass A: Add helper modules (knowledge + logic + contracts).
- Pass B: Implement host orchestration and command execution.
- Pass C: Add deterministic unit/integration-light tests.
- Pass D: Wire local file dependency for `npx calculogic-report-capture` usage.
