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
      // Some components run into issues with jsdom, so we run them in happy-dom instead
      /* jsdom's buffer impl doesn't match dom impl, and viem expects this to match */
      ["**/voting.test.tsx", "happy-dom"],
      ["**/round.test.tsx", "happy-dom"],
      ["**/ViewRoundPage.test.tsx", "happy-dom"],
      ["**/ApplyNowSection.test.tsx", "happy-dom"],
      ["**/LandingPage.test.tsx", "happy-dom"],
      ["**/useFilterRounds.test.tsx", "happy-dom"],
      ["**/createRoundsStatusFilter.test.tsx", "happy-dom"],
      ["**/getExplorerPageTitle.test.tsx", "happy-dom"],
      ["**/getFilterLabel.test.tsx", "happy-dom"],

      // most component tests need to be tsx and run in jsdom
      ["**/*.tsx", "jsdom"],
      // everything else runs in node
      ["**/*", "node"],
    ],
    setupFiles: ["dotenv-flow/config", "src/setupTests.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/e2e/**",
    ],
  },
});
