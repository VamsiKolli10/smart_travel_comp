import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.js",
    globals: true,
    css: false, // Disable CSS processing in tests to avoid parsing errors
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: ["node_modules", "dist"],
    testTimeout: 10000,
  },
  // Mock CSS imports during testing
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "test"),
  },
  // Alias imports to mock modules only in test environment
  resolve:
    process.env.NODE_ENV === "test"
      ? {
          alias: {
            // Mock CSS imports
            "maplibre-gl/dist/maplibre-gl.css": "src/test/mockStyles.js",
            "./Landing.css": "src/test/mockStyles.js",
            "@/styles/global.css": "src/test/mockStyles.js",
            // Mock MapLibre GL JS
            "maplibre-gl": "src/test/mockMapLibre.js",
          },
        }
      : undefined,
});
