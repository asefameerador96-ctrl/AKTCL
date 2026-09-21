import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { imagetools } from "vite-imagetools";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  // imagetools generates the width variants referenced by "?w=...&as=picture"
  // imports (see src/content/images.ts), so a phone fetches an image sized for its
  // screen instead of the 1920px master.
  plugins: [react(), imagetools()],
  build: {
    rollupOptions: {
      output: {
        // Split by library so dependencies stay cached across deploys and a copy
        // change does not make every visitor re-download React.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router")) return "router";
          if (id.includes("@radix-ui")) return "ui";
          if (/react-hook-form|@hookform|[\\/]zod[\\/]/.test(id)) return "forms";
          // Only the inner pages have a photo carousel; keep it off the homepage.
          if (id.includes("embla-carousel")) return "carousel";
          // react, react-dom and scheduler must stay in one chunk together.
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
