import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "qr-scanner": "qr-scanner/qr-scanner.min.js",
    },
  },
  optimizeDeps: {
    include: ['qr-scanner'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'qr-scanner': ['qr-scanner'],
        },
      },
    },
  },
}));
