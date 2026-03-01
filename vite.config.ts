import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@calculogic/doc-engine': './calculogic-doc-engine/src/index.ts',
    },
  },
})
