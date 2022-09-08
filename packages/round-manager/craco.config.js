const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: {
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
         * @param {import('webpack').WebpackError} warning
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
      add: [
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
      ],
    },
  },
};
