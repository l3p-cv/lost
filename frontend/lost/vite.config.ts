import react from '@vitejs/plugin-react'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'
import { defineConfig } from 'vite'
import commonjs from 'vite-plugin-commonjs'
export default defineConfig({
    plugins: [react(), polyfillNode({ polyfills: { buffer: true } }), commonjs()],
    optimizeDeps: {
        include: ['react-draggable', 'semantic-ui-react'],
    },
    define: {
        global: 'globalThis', // added this to fix global not found issue in dev mode for react-autocomplete
    },
})
