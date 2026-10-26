/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // KaTeX + motion + React land around 700 kB (≈220 kB gzipped). Fine for now;
    // split routes with React.lazy if it grows.
    chunkSizeWarningLimit: 800,
  },
  test: {
    // Pure logic runs in Node; component tests opt into jsdom with a file comment.
    environment: "node",
  },
});
