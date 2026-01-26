import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import legacy from "@vitejs/plugin-legacy";
import autoprefixer from "autoprefixer";

export default defineConfig({
  root: "./",
  base: "/",
  server: {
    strictPort: true,
    port: 5174,
    allowedHosts: ["test-app.gitrebase.be"]
  },
  preview: {
    strictPort: true,
    port: 5174,
    allowedHosts: ["test-app.gitrebase.be"]
  },
  publicDir: "public",
  resolve: {},
  build: {
    /*
    YEAR: +/- 2022
    https://vite.dev/config/build-options
    Widely Available on 2025-05-01. Specifically, it is ["chrome107", "edge107", "firefox104", "safari16"].
    */
    target: "baseline-widely-available",
    outDir: "./dist",
    emptyOutDir: true,
    sourcemap: true
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer({ overrideBrowserslist: ["baseline 2022"] })
      ]
    }
  },
  plugins: [
    Inspect(),
    legacy({
      targets: ["baseline 2022"],
      polyfills: true,
      modernPolyfills: [
        "es.promise.with-resolvers",
        "es.symbol.dispose",
        "es.symbol.async-dispose",
        "es.disposable-stack.constructor",
        "es.iterator.dispose",
        "es.async-disposable-stack.constructor",
        "es.async-iterator.async-dispose",
        "esnext.observable"
      ]
    })
  ],
  optimizeDeps: {
    include: []
  }
});