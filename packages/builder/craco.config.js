const path = require("path");
const CracoEsbuildPlugin = require("craco-esbuild");
const VerifyEnvPlugin = require("./VerifyEnvWebpackPlugin");

module.exports = {
  webpack: {
    plugins: {
      add: [
        new VerifyEnvPlugin({
          filePath: ".env.example", // Specify the path to your .env.example file
        }),
      ],
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
    },
  },
  plugins: [
    {
      plugin: CracoEsbuildPlugin,
      options: {
        includePaths: [path.join(__dirname, `../common/src`)],
        skipEsbuildJest: true,
      },
    },
  ],
};
