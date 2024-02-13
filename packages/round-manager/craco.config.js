const webpack = require("webpack");
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const CracoEsbuildPlugin = require("craco-esbuild");
const path = require("path");
const { VerifyEnvPlugin } = require("verify-env");

const plugins = [
  new webpack.ProvidePlugin({
    Buffer: ["buffer", "Buffer"],
  }),
  new VerifyEnvPlugin(),
];

if (process.env.REACT_APP_ENV === "production") {
  plugins.push(
    new SentryWebpackPlugin({
      org: "gitcoin-protocol",
      project: "grants-round-ge",

      // Specify the directory containing build artifacts
      include: "./build",

      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and needs the `project:releases` and `org:read` scopes
      authToken: process.env.REACT_APP_SENTRY_AUTH_TOKEN,

      // Optionally uncomment the line below to override automatic release name detection
      // release: process.env.RELEASE,
    })
  );
}

module.exports = {
  webpack: {
    configure: {
      devtool: "source-map", // Source map generation must be turned on
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
          util: require.resolve("util"),
        },
      },
      experiments: {
        asyncWebAssembly: true,
      },
      ignoreWarnings: [
        // Ignore warnings raised by source-map-loader.
        // some third party packages may ship miss-configured sourcemaps, that interrupts the build
        // See: https://github.com/facebook/create-react-app/discussions/11278#discussioncomment-1780169
        /**
         *
         * @param {import("webpack").WebpackError} warning
         * @returns {boolean}
         */
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes("node_modules") &&
            warning.details &&
            warning.details.includes("source-map-loader")
          );
        },
      ],
    },
    plugins: {
      add: plugins,
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
          target: "es2021",
        },
        esbuildMinimizerOptions: {
          target: "es2021",
        },
      },
    },
  ],
};
