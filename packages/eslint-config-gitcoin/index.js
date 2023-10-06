module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  env: {
    browser: true,
    node: true,
  },
  overrides: [
    {
      files: ["**/*.test.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-empty-function": "off",
      },
    },
    {
      files: ["**/*.{ts,tsx,js,jsx}"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
};
