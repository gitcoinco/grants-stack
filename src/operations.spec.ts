import { add, multiplyByPI } from "./operations";

describe("suite", () => {
  test("addition", () => {
    expect(add(2, 4)).toBe(6);
  });

  test("multiplication by PI", () => {
    expect(multiplyByPI(2)).toBe(6.28);
  });
});
