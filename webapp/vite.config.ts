import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `--mode export` builds the standalone, shareable HTML version (see scripts/export-html.mjs):
// relative paths, no code splitting, so it can be inlined into one file.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'export' || mode === 'artifact' ? './' : '/',
  build:
    mode === 'export' || mode === 'artifact'
      ? { outDir: 'export-build', emptyOutDir: true, assetsInlineLimit: 0, rolldownOptions: { output: { codeSplitting: false } } }
      : undefined,
}))
