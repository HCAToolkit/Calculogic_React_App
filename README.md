Calculogic React App
A modular, JSON-driven form-builder in React. Design, preview and publish dynamic questionnaires via a five-stage UI.

Table of Contents
Features

Tech Stack

Getting Started

Development

Building for Production

Project Structure

Configuration Architecture

Contributing

License

Features
Five-tab builder:

Build – drag & drop containers, fields, sub-containers

View – style and layout controls

Knowledge – attach tooltips, help text, validation rules

Results – configure scoring, branching logic

Publish – export/share final JSON

Atomic components: text input, number input, checkbox, search selector

Live preview pane updates as you edit

Pluggable runtime engine evaluates conditions & maps outputs

TypeScript, ESLint, Vite for fast feedback loops

Tech Stack
React 18 + TypeScript

Vite (development server & build)

ESLint + Prettier (code quality)

Jest + React Testing Library (unit/integration tests)

Getting Started
Prerequisites
Node.js ≥ 16

npm (or Yarn)

Install
bash
git clone https://github.com/your-org/Calculogic_React_App.git
cd Calculogic_React_App
npm install
Development
Launch a local dev server with hot-reload:

bash
npm run dev
Open http://localhost:5173 to view the builder. Changes to src/ reload instantly.

Building for Production
Generate an optimized build in dist/:

bash
npm run build
You can then serve dist/ with any static file host.

Project Structure
Code
/
├─ public/            
│   └─ index.html     # HTML template
├─ src/               
│   ├─ builder/       # Builder UI & tab modules
│   ├─ components/    # Shared React components
│   ├─ engine/        # JSON runtime & logic evaluator
│   └─ App.tsx        # Root component & routing
├─ dist/              # Production output
├─ package.json       # Scripts & dependencies
├─ eslint.config.js   # ESLint rules
├─ tsconfig.json      # TypeScript config
└─ vite.config.ts     # Vite build/dev config
Configuration Architecture
All the details on how your JSON “Configurations” are structured lives in our living spec:

https://docs.google.com/document/d/1UNlEDQTqWKbuq2QIFNIhYWxzMzj_opopgXu4QIScZKA/edit

That guide covers:

Configuration schema (containers, fields, sub-containers)

How Build/View/Knowledge/Results/Publish tabs map to JSON

Runtime rendering, validation and scoring

Exporting/shareable JSON format

Contributing
Fork the repo

Create a feature branch (git checkout -b feature/name)

Commit your changes (git commit -m "feat: add xyz")

Push to your branch (git push origin feature/name)

Open a Pull Request with details and screenshots

See CONTRIBUTING.md for full guidelines.

License
This project is MIT-licensed. See LICENSE for details.