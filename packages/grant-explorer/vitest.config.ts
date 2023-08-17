import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    alias: [
      {
        find: /.*\.svg/,
        replacement: "./src/fileMock.js",
      },
    ],
    globals: true,
    environmentMatchGlobs: [
      // all component tests need to be tsx and run in jsdom
      ["**/*.tsx", "jsdom"],
      // everything else runs in node
      ["**/*", "node"],
    ],
    setupFiles: "src/setupTests.ts",
  },
});
