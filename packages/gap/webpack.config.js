const path = require("path");

module.exports = {
  entry: "./src/index.ts", // Adjust the entry point as needed
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "gap.bundle.js",
    library: "GAP",
    libraryTarget: "umd",
    globalObject: "this",
  },
  mode: "production",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          // Use a separate tsconfig for the GAP package
          configFile: "tsconfig.build.json",
        },
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    // Do not externalize ethers; include it in the bundle
    // Exclude dependencies you don't want to bundle
    react: "react",
  },
};
