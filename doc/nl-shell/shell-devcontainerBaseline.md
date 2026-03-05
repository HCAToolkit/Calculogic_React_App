# shell-devcontainerBaseline – Devcontainer Baseline Shell

This document is an instance of the ProjectShell-Level NL Skeleton defined in ../ConventionRoutines/General-NL-Skeletons.md.

## 1. Purpose and Scope

### 1.1 Purpose

Define the default Codespaces/devcontainer tooling baseline so contributors get a consistent Node/runtime toolchain and required CLI utilities without manual setup.

### 1.2 Context

Covers `.devcontainer/devcontainer.json` and `.devcontainer/README.md` as the canonical baseline pairing for Codespaces behavior.

### 1.3 Interactions

Aligns with root `README.md` prerequisite messaging and root `package.json` engine constraints.

## 2. Configuration Contracts

### 2.1 Interfaces

- JSON devcontainer contract with `image`, `postCreateCommand`, and forwarded ports.

### 2.2 Environment Requirements

- Node baseline provided by image `mcr.microsoft.com/devcontainers/javascript-node:22`.
- Post-create installs `ripgrep`, project dependencies, and runs `npm run build`.

### 2.3 Documentation Contract

- `.devcontainer/README.md` summarizes and maintains the baseline details.

## 3. Build Concern (Structure)

### 3.0 Dependencies & Hierarchy Notes

- Devcontainer image determines Node baseline.

### 3.1 Containers

- None.

### 3.2 Subcontainers

- None.

### 3.3 Primitives

- **[3.3.1] Primitive – "Devcontainer Image Baseline"**
- **[3.3.2] Primitive – "Post-create Tool Bootstrap"**

## 4. BuildStyle Concern

Not applicable for this shell.

## 5. Logic Concern

### 5.0 Dependencies

- Debian apt package manager in the devcontainer image.

### 5.1 Containers

- None.

### 5.2 Primitives

- **[5.2.1] Primitive – "Install ripgrep"** via `apt-get`.
- **[5.2.2] Primitive – "Install deps + build"** via npm commands.

## 6. Knowledge Concern

### 6.1 Constants

- Node baseline: 22+.
- Required utility: `rg`.

## 7. Results Concern

- Baseline outcome is a ready-to-use Codespace where `rg` and project build artifacts are available after creation.

## 8. ResultsStyle Concern

Not applicable.

## 9. Assembly Pattern

### 9.1 File Structure

- `.devcontainer/devcontainer.json`
- `.devcontainer/README.md`
- `README.md`
- `package.json`

### 9.2 Integration

- Keep node baseline references synchronized across these files.

## 10. Implementation Passes

### 10.1 Pass Mapping

- Pass 0: NL skeleton update.
- Pass 1: Update devcontainer post-create command.
- Pass 2: Add devcontainer baseline README.
- Pass 3: Align package engines and root README pointer.
