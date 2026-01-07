import { defineConfig } from "vite";

export default defineConfig({
  root: "./",
  base: "/",
  server: {
    strictPort: true,
    port: 5174,
  },
  publicDir: "public",
  resolve: {},
  build: {
    target: "ES2022",
    outDir: "./dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  plugins: [],
  optimizeDeps: {
    include: []
  }
});
