import react from '@vitejs/plugin-react'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'
import { defineConfig } from 'vite'
import commonjs from 'vite-plugin-commonjs'
import path from 'path'
export default defineConfig({
  resolve: {
    alias: {
      'lost-sia/models': path.resolve(__dirname, '../../../lost-sia/src/models/index.ts'),
      'lost-sia/utils': path.resolve(__dirname, '../../../lost-sia/src/utils/index.ts'),
      'lost-sia': path.resolve(__dirname, '../../../lost-sia/src/index.ts'),
    },
  },
  plugins: [react(), polyfillNode({ polyfills: { buffer: true } }), commonjs()],
  optimizeDeps: {
    // added this to fix the issue with semantic-ui-react some other dependencies
    include: [
      'react-draggable',
      '@semantic-ui-react/event-stack',
      'keyboard-key',
      'shallowequal',
      'react-fast-compare',
      'warning',
      'react-is',
    ],
  },
  define: {
    global: 'globalThis', // added this to fix global not found issue in dev mode for react-autocomplete
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
