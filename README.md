Calculogic React App

A React-only implementation of the Calculogic Builder: a no-code, atomic-component form and logic builder designed to be portable to WordPress, desktop (Electron), and mobile (Capacitor) environments.

📦 Tech Stack

Framework & Build: React, Vite

State Management: Zustand (with persist middleware)

Logic Engine: json-logic-js

Templating Engine: Mustache.js

Routing (optional): React Router DOM

Language: TypeScript

⚙️ Prerequisites

Node.js (v14+)

npm (v6+)

Git

🚀 Getting Started

Clone the repository

git clone https://github.com/<your-username>/calculogic-core.git
cd calculogic-core

Install dependencies

npm install

Run in development mode

npm run dev

Open your browser at http://localhost:5173 (or the URL printed by Vite).

Build for production

npm run build

The static output will be in the dist/ folder.

Preview the production build

npm run serve

🗂 Project Structure

calculogic-core/
├── public/                # Public assets (favicon, vite.svg)
├── src/
│   ├── assets/            # Static assets (SVG, images)
│   ├── components/        # Reusable atomic React components
│   ├── state/             # Zustand store definitions
│   ├── tabs/              # UI for each builder tab (Build, Logic, etc.)
│   │   └── BuildTab.tsx   # Initial Build tab implementation
│   ├── App.tsx            # Root component (renders tab navigation)
│   └── main.tsx           # React entrypoint
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md             # You are here

📋 Core Features (MVP)

Build Tab (src/tabs/BuildTab.tsx)

Add "Number Input" fields dynamically.

Fields stored in a global Zustand store (src/state/useStore.ts).

Global State

Managed in useStore with structure (field definitions).

setStructure action to update the form schema.

Persistence (LocalStorage)

(Planned) use Zustand persist middleware to auto-save the builder state.

🎯 Next Steps & Roadmap

Logic Tab: integrate json-logic-js to let users define calculation rules.

View Tab: allow styling of fields via atomic CSS classes or inline styles.

Knowledge Tab: support importing external data sets or reference tables.

Results Tab: render final output with mustache.js templates and live preview.

Dashboard: list, load, and manage multiple projects.

Data Providers: abstract save/load to WordPress REST, Electron FS, or Capacitor Storage.

Packaging: wrap the final build as a WordPress plugin, an Electron app, and a Capacitor mobile app.

🤝 Contributing

Fork the repository

Create your feature branch (git checkout -b feature/your-feature)

Commit your changes (git commit -m 'feat: add new ...')

Push to the branch (git push origin feature/your-feature)

Open a Pull Request

📄 License

This project is licensed under the MIT License. See LICENSE for details.