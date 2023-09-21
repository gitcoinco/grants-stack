import { verify } from "./verify.ts";
export class VerifyEnvPlugin {
  private readonly srcPaths: string[];
  constructor(srcPath: string[] = ["src/", "../common/src"]) {
    this.srcPaths = srcPath;
  }
  apply(compiler: any) {
    compiler.hooks.run.tap("VerifyEnvPlugin", () => {
      return verify(this.srcPaths);
    });
  }
}

module.exports = { VerifyEnvPlugin };
