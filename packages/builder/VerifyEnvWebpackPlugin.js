const fs = require("fs");
const path = require("path");

class VerifyEnvPlugin {
  constructor(options) {
    this.filePath = options.filePath || ".env.example";
  }

  apply(compiler) {
    compiler.hooks.run.tap("VerifyEnvPlugin", () => {
      /** Get all source files */

      // Recursive function to get files with specific extensions
      const getFilesWithExtensions = (dir, extensions, fileList = []) => {
        const files = fs.readdirSync(dir);

        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            getFilesWithExtensions(filePath, extensions, fileList); // Recurse into subdirectories
          } else {
            const ext = path.extname(file);
            if (extensions.includes(ext)) {
              fileList.push(filePath); // Add to fileList if it matches the extensions
            }
          }
        });

        return fileList;
      };

      // Extensions to look for
      const extensions = [".ts", ".tsx", ".js", ".jsx"];

      // Directory to search
      const srcDir = "src/";

      const files = getFilesWithExtensions(srcDir, extensions);

      // Initialize an array to store the extracted environment variables
      const envVars = [];

      // Function to extract environment variables from file content
      const extractEnvVars = (content) => {
        const regex = /process\.env\.([A-Z0-9_]+)/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
          envVars.push(match[1]);
        }
      };

      // Read each file and extract environment variables
      files.forEach((filePath) => {
        try {
          const fileContent = fs.readFileSync(filePath, "utf-8");
          extractEnvVars(fileContent);
        } catch (error) {
          console.error(`Error reading file ${filePath}: ${error}`);
        }
      });

      // Remove duplicates
      const uniqueEnvVars = [...new Set(envVars)];
      console.log(uniqueEnvVars);
      this.verifyEnvVariables(uniqueEnvVars);
    });
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
