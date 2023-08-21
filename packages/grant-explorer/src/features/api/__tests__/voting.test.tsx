import { selectPermitType } from "../voting";
import { MAINNET_TOKENS, OPTIMISM_MAINNET_TOKENS } from "../utils";

describe("selectPermitType", () => {
  it("selects dai permit type correctly for mainnet", () => {
    expect(
      selectPermitType(MAINNET_TOKENS.find((token) => token.name === "DAI")!)
    ).toBe("dai");
  });

  it("selects dai permit type correctly for optimism", () => {
    expect(
      selectPermitType(
        OPTIMISM_MAINNET_TOKENS.find((token) => token.name === "DAI")!
      )
    ).toBe("eip2612");
  });
});
