import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.js",
    globals: true,
    css: false,
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: ["node_modules", "dist"],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
        "**/.{idea,git,cache,output,temp}/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      ],
    },
  },
  resolve: {
    alias: {
      // Mock CSS imports
      "maplibre-gl/dist/maplibre-gl.css": "/src/test/mockStyles.js",
      "./Landing.css": "/src/test/mockStyles.js",
      "@/styles/global.css": "/src/test/mockStyles.js",
      // Mock MapLibre GL JS
      "maplibre-gl": "/src/test/mockMapLibre.js",
    },
  },
});
