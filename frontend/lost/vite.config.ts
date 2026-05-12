import react from '@vitejs/plugin-react'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'
import { defineConfig } from 'vite'
import commonjs from 'vite-plugin-commonjs'
export default defineConfig({
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
