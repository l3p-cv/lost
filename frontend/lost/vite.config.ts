import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

export default defineConfig({
  plugins: [react(), polyfillNode({ polyfills: { buffer: true } })],
});
