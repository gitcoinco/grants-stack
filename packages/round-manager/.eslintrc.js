module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  parserOptions: { project: ["./tsconfig.json"] },
  rules: {
    "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
