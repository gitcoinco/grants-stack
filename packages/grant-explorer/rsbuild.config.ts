import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";
const path = require("path");

const { publicVars } = loadEnv({ prefixes: ["REACT_APP_"] });

export default defineConfig({
  plugins: [pluginReact(), pluginSvgr()],
  html: {
    template: "./public/index.html",
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  source: {
    define: publicVars,
    alias: {
      localforage: path.resolve(
        __dirname,
        "./node_modules/localforage/src/localforage.js"
      ),
      jszip: path.resolve(__dirname, "./node_modules/jszip/lib/index.js"),
      "readable-stream": require.resolve("readable-stream"),
      "csv-stringify": "csv-stringify/browser/esm",
    },
  },
  tools: {
    rspack(config, { appendPlugins }) {
      // Only register the plugin when RSDOCTOR is true, as the plugin will increase the build time.
      if (process.env.RSDOCTOR) {
        appendPlugins(
          new RsdoctorRspackPlugin({
            // plugin options
          })
        );
      }
    },
  },
});
