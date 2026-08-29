# shell-devcontainerBaseline – Devcontainer Baseline Shell

This document is an instance of the ProjectShell-Level NL Skeleton defined in ../ConventionRoutines/General-NL-Skeletons.md.

## 1. Purpose and Scope

### 1.1 Purpose

Define the default Codespaces/devcontainer tooling baseline so contributors get a consistent Node/runtime toolchain, required CLI utilities, and the standalone validator checkout needed for cross-repository validator development without manual setup.

### 1.2 Context

Covers `.devcontainer/devcontainer.json`, `.devcontainer/README.md`, and `.devcontainer/ensure-standalone-validator-checkout.sh` as the canonical baseline pairing plus checkout helper for Codespaces behavior.

### 1.3 Interactions

Aligns with root `README.md` prerequisite messaging and root `package.json` engine constraints.

The standalone validator checkout remains an independent Git repository and authoritative validator source. Codespace preparation may make that checkout available beside the React app, but it does not automatically activate `npm link` or replace stable package-consumption mode.

## 2. Configuration Contracts

### 2.1 Interfaces

- JSON devcontainer contract with `image`, `postCreateCommand`, and forwarded ports.
- Shell checkout-helper contract that ensures a sibling `HCAToolkit/calculogic-validator` Git checkout exists when the Codespace is created.

### 2.2 Environment Requirements

- Node baseline provided by image `mcr.microsoft.com/devcontainers/javascript-node:22`.
- Post-create installs `ripgrep`, project dependencies, runs `npm run build`, and then ensures the standalone validator checkout is available.
- Default checkout layout is:

```text
/workspaces/
├─ Calculogic_React_App/
└─ calculogic-validator/
```

- `CALCULOGIC_VALIDATOR_CHECKOUT` may override the default sibling checkout location.
- If the validator checkout already exists as a Git checkout, the helper leaves it unchanged.
- The helper does not fetch, reset, overwrite, or automatically `npm link` an existing validator checkout.
- If the target checkout path exists but is not a Git checkout, setup fails rather than overwriting that path.

### 2.3 Documentation Contract

- `.devcontainer/README.md` summarizes and maintains the baseline details, including the shared-checkout layout and explicit live-link workflow.

## 3. Build Concern (Structure)

### 3.0 Dependencies & Hierarchy Notes

- Devcontainer image determines Node baseline.
- React app and standalone validator remain sibling Git repositories rather than one nested source tree.
- The existing embedded `calculogic-validator/` directory is not the authoritative standalone checkout prepared by this shell.

### 3.1 Containers

- None.

### 3.2 Subcontainers

- None.

### 3.3 Primitives

- **[3.3.1] Primitive – "Devcontainer Image Baseline"**
- **[3.3.2] Primitive – "Post-create Tool Bootstrap"**
- **[3.3.3] Primitive – "Standalone Validator Checkout Bootstrap"**

## 4. BuildStyle Concern

Not applicable for this shell.

## 5. Logic Concern

### 5.0 Dependencies

- Debian apt package manager in the devcontainer image.
- Git CLI and GitHub network access for first-time standalone validator checkout creation.

### 5.1 Containers

- None.

### 5.2 Primitives

- **[5.2.1] Primitive – "Install ripgrep"** via `apt-get`.
- **[5.2.2] Primitive – "Install deps + build"** via npm commands.
- **[5.2.3] Primitive – "Ensure standalone validator checkout"** by resolving the React app repository root, choosing the sibling/default or explicitly overridden validator checkout location, preserving an existing Git checkout, and cloning `HCAToolkit/calculogic-validator` only when the checkout is absent.
- **[5.2.4] Primitive – "Keep live linking explicit"** by preparing both repositories without automatically running `npm link`.

## 6. Knowledge Concern

### 6.1 Constants

- Node baseline: 22+.
- Required utility: `rg`.
- Standalone validator remote: `https://github.com/HCAToolkit/calculogic-validator.git`.
- Default standalone validator checkout name: `calculogic-validator`.
- Optional checkout override environment variable: `CALCULOGIC_VALIDATOR_CHECKOUT`.

## 7. Results Concern

- Baseline outcome is a ready-to-use Codespace where `rg` and project build artifacts are available after creation.
- The standalone validator Git checkout is also available beside the React app checkout for explicit stable-package or `npm link` workflows.
- Preparing the checkout does not itself change the React app's validator dependency mode.

## 8. ResultsStyle Concern

Not applicable.

## 9. Assembly Pattern

### 9.1 File Structure

- `.devcontainer/devcontainer.json`
- `.devcontainer/README.md`
- `.devcontainer/ensure-standalone-validator-checkout.sh`
- `README.md`
- `package.json`

### 9.2 Integration

- Keep Node baseline references synchronized across these files.
- Keep the post-create command, checkout-helper behavior, and devcontainer README aligned.
- Keep stable package consumption and explicit `npm link` development as separate modes.

## 10. Implementation Passes

### 10.1 Pass Mapping

- Pass 0: NL skeleton update.
- Pass 1: Update devcontainer post-create command.
- Pass 2: Add standalone validator checkout helper.
- Pass 3: Update devcontainer baseline README with shared-checkout and explicit-link behavior.
- Pass 4: Align package engines and root README pointer when the runtime baseline changes.
