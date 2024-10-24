const path = require("path");
const CracoEsbuildPlugin = require("craco-esbuild");
const { VerifyEnvPlugin } = require("verify-env");
const { config } = require("dotenv");

config({
  path: path.join(__dirname, "../../.env"),
});

const esmModules = [
  "@rainbow-me",
  "@spruceid",
  "wagmi",
  "@wagmi",
  "github\\.com\\+gitcoinco\\+allo\\-indexer\\-client",
];

module.exports = {
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
