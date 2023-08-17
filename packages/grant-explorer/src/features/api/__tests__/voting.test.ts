import { selectPermitType } from "../voting";
import { MAINNET_TOKENS } from "../utils";

describe("selectPermitType", () => {
  it("selects dai permit type correctly for mainnet", () => {
    expect(
      selectPermitType(MAINNET_TOKENS.find((token) => token.name === "DAI")!)
    ).toBe("dai");
  });
});
