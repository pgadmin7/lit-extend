import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  root: "./",
  base: "/",
  server: {
    strictPort: true,
    port: 5175,
  },
  plugins: [vue(), vueDevTools()]
});
