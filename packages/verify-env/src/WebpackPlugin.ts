import { verify } from "./index.ts";
import type webpack from "webpack";
export class VerifyEnvPlugin {
  private readonly srcPath: string;
  constructor(srcPath: string = "src/") {
    this.srcPath = srcPath;
  }
  apply(compiler: webpack.Compiler) {
    compiler.hooks.run.tap("VerifyEnvPlugin", () => {
      return verify(this.srcPath);
    });
  }
}

module.exports = VerifyEnvPlugin;
