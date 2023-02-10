module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  rules: {
    // "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
  },
  overrides: [
    {
      files: ["**/*.test.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-empty-function": "off",
        // "@typescript-eslint/no-unused-vars": [
        //   "warn",
        //   {
        //     varsIgnorePattern: "^_$",
        //     destructuredArrayIgnorePattern: "^_$",
        //     argsIgnorePattern: "^_$"
        //   }
        // ],
      },
    },
    {
      files: ["**/*.{ts,tsx}"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
};
