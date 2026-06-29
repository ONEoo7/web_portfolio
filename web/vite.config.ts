import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  // Served from a GitHub Pages *project* site at https://oneoo7.github.io/web_portfolio/.
  // Change to "/" for a user/org site (oneoo7.github.io) or a custom domain.
  base: "/web_portfolio/",
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "../app"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
