# **Calculogic React App**

A modular, JSON-driven form-builder in React.
Design, preview, and publish dynamic questionnaires through a five-stage UI.
Built for creators, educators, and system designers who want full transparency and control.

---

## **Table of Contents**

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Development](#development)
5. [Building for Production](#building-for-production)
6. [Project Structure](#project-structure)
7. [Configuration Architecture](#configuration-architecture)
8. [Calculogic-Style Concern System (CSCS)](#calculogic-style-concern-system-cscs)
9. [Comment & Provenance Protocol (CCPP)](#comment--provenance-protocol-ccpp)
10. [Contributing](#contributing)
11. [License](#license)

---

## **Features**

**Five-tab builder:**

* **Build** – drag-and-drop containers, fields, and sub-containers
* **View** – style and layout controls
* **Logic** – define conditional behavior
* **Knowledge** – attach tooltips, help text, and validation rules
* **Results** – configure scoring, branching, and summaries

**Core Capabilities**

* Atomic components: text, number, checkbox, search selector
* Live preview pane updates as you edit
* Pluggable runtime engine for evaluating conditions and outputs
* JSON-first configuration system (readable, exportable, versionable)
* TypeScript, ESLint, and Vite for rapid iteration and safety

---

## **Tech Stack**

* **React 18 + TypeScript**
* **Vite** – dev server & optimized builds
* **ESLint + Prettier** – code quality & formatting
* **Jest + React Testing Library** – unit/integration tests

---

## **Getting Started**

### **Prerequisites**

* Node.js ≥ 16
* npm (or Yarn)

### **Install**

```bash
git clone https://github.com/your-org/Calculogic_React_App.git
cd Calculogic_React_App
npm install
```

---

## **Development**

Start a local development server with hot-reload:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the builder.
Changes to files in `src/` reload automatically.

---

## **Building for Production**

Generate an optimized production build in `dist/`:

```bash
npm run build
```

You can serve the output with any static file host.

---

## **Project Structure**

```
/
├─ public/            
│   └─ index.html          # HTML template
├─ src/               
│   ├─ builder/            # Builder UI & tab modules
│   ├─ components/         # Shared React components
│   ├─ engine/             # JSON runtime & logic evaluator
│   └─ App.tsx             # Root component & routing
├─ dist/                   # Production output
├─ package.json            # Scripts & dependencies
├─ eslint.config.js        # Linting rules
├─ tsconfig.json           # TypeScript config
└─ vite.config.ts          # Vite build/dev config
```

---

## **Configuration Architecture**

All structural, logic, and scoring details for Calculogic live in the **Configuration Architecture** —
a living specification describing how JSON configurations represent forms, quizzes, and templates.

📄 [View the external document](https://docs.google.com/document/d/1UNlEDQTqWKbuq2QIFNIhYWxzMzj_opopgXu4QIScZKA/edit)
📚 [Read the local summary](doc/ConfigurationArchitectureSummary.md)

**Covers**

* Configuration schema: containers, fields, and sub-containers
* How Build/View/Logic/Knowledge/Results map to JSON
* Runtime evaluation, validation, and scoring
* Export and shareable JSON formats

---

## **Calculogic-Style Concern System (CSCS)**

The **CSCS** defines how every module is structured and reasoned about.
It guarantees architectural purity and predictable diffs across the codebase.

**Canonical Order:**
`Build → View → Logic → Knowledge → Results`

**Core Principles**

* **Ordering Source (BOS):** The highest present layer defines structure; all lower layers mirror its top-down order.
* **Attachment-Only for Non-Sources:** Non-BOS layers attach to declared anchors only.
* **Stable Anchors:** Public selectors (class/data-attr) are the sole references.
* **Directional Dependencies:**

  * Build feeds View & Logic
  * Logic feeds Results
  * Knowledge informs all
    No upward or cyclic references.
* **Purity per Layer:**

  * Build = structure | View = appearance | Logic = interaction/state | Knowledge = guidance | Results = derived output
* **Locality:** Co-locate code per concern; nested concerns follow the same rules.
* **Monotonic Diffs:** Changes cascade top-down across sibling layers.
* **Minimal Surface Area:** Expose anchors, events, and read-only signals only.

**Decision Framework**

1. **Concern Definition Protocol (CDP)** — one-page template for defining each concern’s scope, invariants, and acceptance.
2. **Four Tests** — single reason to change, boundary of effects, ordering consistency, visible contract.
3. **Change Management** — promotions, merges, renames, spec-drift guard.
4. **Interfaces & Contracts** — anchors, scoped events, and signals; no hidden coupling.
5. **Acceptance Checklist** — purity, mirroring, and consistent diffs enforced per PR.

**Example Classifications**

| Concern                    | Ordering Source | Description                                                        |
| -------------------------- | --------------- | ------------------------------------------------------------------ |
| Structure & Responsiveness | Build           | Frame, panes, sections; no DnD.                                    |
| Atomic Components          | Build           | Atom list; Logic handles drag-and-drop.                            |
| Configurations             | Build           | Config blocks + persistence; Logic handles DnD; Results summarize. |
| Search/Browse              | Build           | Filter UI; Logic handles queries; Results handle counts.           |

📘 See [`docs/CSCS.md`](docs/CSCS.md) for the full rubric.

For doc-engine modules, use [`doc/DocEngine-CSCS-Mapping.md`](doc/DocEngine-CSCS-Mapping.md) as the concern mapping + naming checklist.

---

## **Comment & Provenance Protocol (CCPP)**

The **CCPP** is Calculogic’s standard for inline documentation, decision history, and provenance tracking.
It ensures every file is self-describing and ethically transparent.

**Principles**

* **BOS Alignment:** Comment order mirrors the Build hierarchy.
* **Five Comment Types:** File Header, Section Header, Inline Rationale, Decision Note, Provenance Block.
* **Explain Why, Not What:** Comments describe reasoning, not narration.
* **Traceability:** External logic or data must include URL, timestamp, hash, and license.
* **Ephemeral Ethics:** No external data is retained; provenance only.
* **Lint Integration:** CI verifies headers, order, TODO expiry, and provenance blocks.

**Example**

```tsx
/**
 * Concern: BuilderShell
 * Layer: View
 * BuildIndex: 01.00
 * AttachesTo: .builder-shell
 * Responsibility: Responsive frame chrome (no behavior)
 * Invariants: No overflow; focus ring visible
 */
export function BuilderShellView(){...}

// [Section 01.10] Header
// Purpose: Global header and tab chrome
// Inputs: layoutMode
// Outputs: none
// Constraints: sticky; min-height 56px

// DECISION: Keyboard navigation | 2025-10-20
// Context: accessibility
// Choice: Arrow keys preferred over mouse drag
// Consequence: simpler pointer code, improved a11y

// SOURCE: https://example.org/a11y/drag-guidance
// Accessed: 2025-10-20T15:04:12Z
// Hash: sha256:9b7c…3ad
// License: CC-BY 4.0
```

📘 Full spec: [`docs/CCPP.md`](docs/CCPP.md)

---

## **Contributing**

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m "feat: add xyz"`)
4. Push to your branch (`git push origin feature/name`)
5. Open a Pull Request with details and screenshots

Follow [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full workflow.
All new code must comply with **CSCS** and **CCPP** standards.
