import { test, expect } from "vitest";
import { parseChainId } from "./chains";
import { ChainId } from "./chain-ids";

test("Valid input: number", () => {
  const input = 137;
  const result = parseChainId(input);
  expect(result).toBe(ChainId.POLYGON);
});

test("Valid input: string (number as string)", () => {
  const input = "80001";
  const result = parseChainId(input);
  expect(result).toBe(ChainId.POLYGON_MUMBAI);
});

test("Invalid input: string (non-existent enum name)", () => {
  const input = "NON_EXISTENT_CHAIN";
  expect(() => parseChainId(input)).toThrow("Invalid chainId " + input);
});

test("Invalid input: string (non-numeric string)", () => {
  const input = "invalid";
  expect(() => parseChainId(input)).toThrow("Invalid chainId " + input);
});

test("Invalid input: number (non-existent enum value)", () => {
  const input = 999;
  expect(() => parseChainId(input)).toThrow("Invalid chainId " + input);
});

test("Invalid input: null", () => {
  const input = null;
  expect(() => parseChainId(input as any)).toThrow("Invalid chainId null");
});

test("Invalid input: undefined", () => {
  const input = undefined;
  expect(() => parseChainId(input as any)).toThrow("Invalid chainId undefined");
});
