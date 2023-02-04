/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "jsdom",
  clearMocks: true,
  resetMocks: true,
  coverageProvider: "v8",
  verbose: true,
  // @rainbow-me/rainbowkit is already an ESM module and
  // it trips Jest when it tries to transform it, this ignores it
  transformIgnorePatterns: ["node_modules\\/(?!@rainbow-me\\/.*)"],
  moduleNameMapper: { 
    "^.+.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$": "jest-transform-stub"
  },
};
