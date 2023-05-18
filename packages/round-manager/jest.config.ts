import { Config } from "jest";

const esModules = [
  "@rainbow-me",
  "@spruceid",
  "github\\.com\\+gitcoinco\\+allo\\-indexer\\-client",
  "wagmi",
  "@wagmi",
  "@gitcoinco",
];

module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "<rootDir>/src/tests/fixedEnvironment.js",
  globals: {
    Uint8Array: Uint8Array,
    ArrayBuffer: ArrayBuffer,
    "ts-jest": {
      diagnostics: {
        exclude: ["**"],
      },
    },
  },
  transform: {
    "^.+.(png|jpg)$": "<rootDir>/src/tests/fileTransform.js",
  },
  moduleNameMapper: {
    "^.+.(css|styl|less|sass|scss|ttf|woff|woff2)$": "jest-transform-stub",
    "^.+.(svg)$": "<rootDir>/src/tests/svgTransform.ts",
  },
  modulePaths: ["<rootDir>"],
  transformIgnorePatterns: [`/node_modules/.pnpm/(?!(${esModules.join("|")}))`],
  setupFilesAfterEnv: ["./src/setupTests.ts"],
} as Config;
