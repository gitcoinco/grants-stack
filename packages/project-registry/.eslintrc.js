module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: "@typescript-eslint/parser",
  extends: ["airbnb", "airbnb-typescript", "prettier"],
  parserOptions: {
    project: "./tsconfig.json",
    ecmaVersion: 12,
    sourceType: "module",
    tsx: true,
  },
  plugins: ["react", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "react/react-in-jsx-scope": "off",
    "default-case": "off",
    "max-classes-per-file": "off",
    "class-methods-use-this": "off",
    "@typescript-eslint/default-param-last": "off",
    "import/no-cycle": "off",
    "import/no-extraneous-dependencies": "off",
    "react/prop-types": "off",
    "max-len": ["error", { code: 150 }],
    "no-console": "off",
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      // "ForOfStatement", // used for async iterators
      "LabeledStatement",
      "WithStatement",
    ],
    "eol-last": ["error", "always"],
    "react/require-default-props": "off",
  },
  ignorePatterns: ["node_modules/"],
};
