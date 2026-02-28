import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api requests to the Express backend during development,
// so the browser never hits a CORS pre-flight for same-origin-looking calls.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
