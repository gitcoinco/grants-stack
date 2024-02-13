const path = require("path");
const CracoEsbuildPlugin = require("craco-esbuild");
const { VerifyEnvPlugin } = require("verify-env");

const esmModules = [
  "@rainbow-me",
  "@spruceid",
  "wagmi",
  "@wagmi",
  "github\\.com\\+gitcoinco\\+allo\\-indexer\\-client",
];

module.exports = {
  jest: {
    configure: () => ({
      preset: "ts-jest/presets/js-with-ts",
      testEnvironment: "jsdom",
      clearMocks: true,
      resetMocks: true,
      coverageProvider: "v8",
      verbose: true,
      // @rainbow-me/rainbowkit is already an ESM module and
      // it trips Jest when it tries to transform it, this ignores it
      transformIgnorePatterns: [
        `/node_modules/.pnpm/(?!(${esmModules.join("|")}))`,
      ],
      moduleNameMapper: {
        "\\.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$":
          require.resolve("jest-transform-stub"),
      },
      setupFilesAfterEnv: ["./src/setupTests.ts"],
      testPathIgnorePatterns: ["/e2e/"],
    }),
  },
  webpack: {
    plugins: {
      add: [new VerifyEnvPlugin()],
    },
    configure: {
      devtool: "eval-source-map",
      module: {
        rules: [
          {
            test: /\.wasm$/,
            type: "webassembly/async",
          },
        ],
      },
      resolve: {
        fallback: {
          crypto: require.resolve("crypto-browserify"),
          buffer: require.resolve("buffer"),
          process: require.resolve("process/browser"),
          stream: require.resolve("stream-browserify"),
          http: require.resolve("stream-http"),
          https: require.resolve("https-browserify"),
          os: require.resolve("os-browserify"),
          url: require.resolve("url"),
        },
      },
      experiments: {
        asyncWebAssembly: true,
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
  plugins: [
    {
      plugin: CracoEsbuildPlugin,
      options: {
        includePaths: [path.join(__dirname, `../common/src`)],
        skipEsbuildJest: true,
        esbuildLoaderOptions: {
          loader: "tsx", // Set the value to 'tsx' if you use typescript
          target: "es2020",
        },
        esbuildMinimizerOptions: {
          target: "es2020",
        },
      },
    },
  ],
};
