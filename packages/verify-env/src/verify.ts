import fs from "fs";
import path from "path";

export function verify(srcDir: string = "src/") {
  // Get all source files
  // Extensions to look for
  const extensions = [".ts", ".tsx", ".js", ".jsx"];
  const files = getFilesWithExtensions(srcDir, extensions);

  // Initialize an array to store the extracted environment variables
  const envVars: string[] = [];

  // Read each file and extract environment variables
  files.forEach((filePath) => {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      envVars.push(...extractEnvVars(fileContent));
    } catch (error) {
      console.error(`Error reading file ${filePath}: ${error}`);
    }
  });

  // Remove duplicates
  const uniqueEnvVars = [...new Set(envVars)];

  // Validate
  const badVars = validateVariables(uniqueEnvVars);
  if (badVars.length > 0) {
    console.error(
      "Error: Some environment variables are not set or are empty:"
    );
    if (badVars.length > 0) {
      console.error(`\n${badVars.join("\n")}\n`);
    }
    process.exit(1);
  }
}

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

export const extractEnvVars = (content: string): string[] => {
  const envVars = [];
  const regex = /process\.env\.([A-Z0-9_]+)/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    envVars.push(match[1]);
  }
  return envVars;
};

export function validateVariables(variables: string[]) {
  return variables.filter((variable) => {
    const value = process.env[variable];
    return (
      value === undefined ||
      value === "" ||
      value === "undefined" ||
      value === "null"
    );
  });
}
