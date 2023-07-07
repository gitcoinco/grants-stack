const fs = require("fs");
const path = require("path");

class VerifyEnvPlugin {
  constructor(options) {
    this.filePath = options.filePath || ".env.example";
  }

  apply(compiler) {
    compiler.hooks.run.tap("VerifyEnvPlugin", () => {
      const envExamplePath = path.resolve(process.cwd(), this.filePath);

      try {
        const envExampleContent = fs.readFileSync(envExamplePath, "utf-8");
        const envExampleVariables = this.extractEnvVariables(envExampleContent);

        this.verifyEnvVariables(envExampleVariables);
      } catch (error) {
        console.error(`Error reading ${this.filePath}:`, error);
        process.exit(1);
      }
    });
  }

  extractEnvVariables(content) {
    const regex = /^\s*([A-Za-z_0-9]+)\s*=/gm;
    let match;
    const variables = [];

    while ((match = regex.exec(content))) {
      variables.push(match[1]);
    }

    return variables;
  }

  verifyEnvVariables(variables) {
    const emptyVariables = variables.filter((variable) => {
      const value = process.env[variable];
      return (
        value === undefined ||
        value === "" ||
        value === "undefined" ||
        value === "null"
      );
    });

    if (emptyVariables.length > 0) {
      console.error(
        "Error: Some environment variables are not set or are empty:"
      );
      if (emptyVariables.length > 0) {
        console.error(`\n${emptyVariables.join("\n")}\n`);
      }
      console.error(
        "Environment variables are checked against the .env.example file"
      );
      console.error(
        "Comment out (add # at the start of the line) a variable to mark it as optional"
      );
      process.exit(1);
    }
  }
}

module.exports = VerifyEnvPlugin;
