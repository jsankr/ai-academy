import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { offlineServiceWorker } from "./sw-plugin";

// Relative base so the same build works on GitHub Pages (/ai-academy/) and on localhost.
export default defineConfig({
  base: "./",
  plugins: [react(), offlineServiceWorker(__dirname)],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    chunkSizeWarningLimit: 700,
  },
});
