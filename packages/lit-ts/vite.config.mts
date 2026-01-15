import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";

export default defineConfig({
  root: "./",
  base: "/",
  server: {
    strictPort: true,
    port: 5174
  },
  publicDir: "public",
  resolve: {},
  build: {
    target: "ES2022",
    outDir: "./dist",
    emptyOutDir: true,
    sourcemap: true
  },
  plugins: [Inspect()],
  optimizeDeps: {
    include: []
  }
});
