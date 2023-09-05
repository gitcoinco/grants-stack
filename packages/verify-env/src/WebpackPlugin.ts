import { verify } from "./verify.ts";
export class VerifyEnvPlugin {
  private readonly srcPath: string;
  constructor(srcPath: string = "src/") {
    this.srcPath = srcPath;
  }
  apply(compiler: any) {
    compiler.hooks.run.tap("VerifyEnvPlugin", () => {
      return verify(this.srcPath);
    });
  }
}

module.exports = { VerifyEnvPlugin };
