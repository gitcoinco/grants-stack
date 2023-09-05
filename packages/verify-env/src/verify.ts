import fs from "fs";
import path from "path";

export function verify(srcDir: string = "src/") {
  /** Get all source files */
  const getFilesWithExtensions = (
    dir: string,
    extensions: string[],
    fileList: string[] = []
  ) => {
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

  const files = getFilesWithExtensions(srcDir, extensions);

  // Initialize an array to store the extracted environment variables
  const envVars: string[] = [];

  // Function to extract environment variables from file content
  const extractEnvVars = (content: string) => {
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
  verifyEnvVariables(uniqueEnvVars);
}

function verifyEnvVariables(variables: string[]) {
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
    process.exit(1);
  }
}
