import { it, expect, vi } from "vitest";
import { extractEnvVars, verify, getInvalidVariables } from "./verify.ts";
import fs from "fs";

it("extracts env vars from a string", () => {
  const source = fs.readFileSync(__dirname + "/testSource.txt").toString();
  const envVars = extractEnvVars(source);
  expect(envVars).toStrictEqual([
    "REACT_APP_ENV",
    "REACT_APP_INFURA_ID",
    "REACT_APP_WALLETCONNECT_PROJECT_ID",
  ]);
});

it("catches set but empty vars", () => {
  process.env.EMPTY = "";
  expect(getInvalidVariables(["EMPTY"])).toStrictEqual(["EMPTY"]);
  delete process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
});

it("catches undefined/null vars", () => {
  process.env.NULL = "null";
  process.env.UNDEFINED = "undefined";
  expect(getInvalidVariables(["NULL", "UNDEFINED"])).toStrictEqual([
    "NULL",
    "UNDEFINED",
  ]);
});

it("passes set vars", () => {
  process.env.OKAY = "okay";
  expect(getInvalidVariables(["OKAY"])).toStrictEqual([]);
});

it("verifies vars from files", () => {
  const consoleMock = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);
  const processMock = vi.spyOn(process, "exit").mockImplementation(() => {
    return undefined as never;
  });

  verify([__dirname + "/test/"]);
  expect(processMock).toHaveBeenCalledOnce();
  expect(processMock).toHaveBeenCalledWith(1);
  expect(consoleMock).toHaveBeenCalledWith(
    "Error: Some environment variables are not set or are empty:",
  );
  expect(consoleMock).toHaveBeenCalledWith(
    `
REACT_APP_ENV
REACT_APP_WALLETCONNECT_PROJECT_ID
REACT_APP_INFURA_ID
REACT_APP_ALCHEMY_ID
`,
  );
});

it("verifies vars from files when some vars are set", () => {
  const consoleMock = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);
  const processMock = vi.spyOn(process, "exit").mockImplementation(() => {
    return undefined as never;
  });

  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID = "thisisset";

  verify([__dirname + "/test/"]);
  expect(processMock).toHaveBeenCalledOnce();
  expect(processMock).toHaveBeenCalledWith(1);
  expect(consoleMock).toHaveBeenCalledWith(
    "Error: Some environment variables are not set or are empty:",
  );
  expect(consoleMock).toHaveBeenCalledWith(
    `
REACT_APP_ENV
REACT_APP_INFURA_ID
REACT_APP_ALCHEMY_ID
`,
  );

  delete process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
});
