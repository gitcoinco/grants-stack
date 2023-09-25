import fs from "fs";
import { globSync } from "glob";

export function verify(srcDir: string[] = ["src/", "../common/src"]) {
  // Get all source files
  // Extensions to look for
  const extensions = [".ts", ".tsx", ".js", ".jsx"];
  const files = srcDir
    .map((src) => globSync(`${src}**/*.{ts,tsx,js,jsx}`))
    .flat();

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
  const badVars = getInvalidVariables(uniqueEnvVars);
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

export const extractEnvVars = (content: string): string[] => {
  const envVars = [];
  const regex = /process\.env\.([A-Z0-9_]+)/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    envVars.push(match[1]);
  }
  return envVars;
};

export function getInvalidVariables(variables: string[]) {
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
