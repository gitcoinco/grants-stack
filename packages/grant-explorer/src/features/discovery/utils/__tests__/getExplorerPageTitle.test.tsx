import {
  ROUND_PAYOUT_DIRECT,
  ROUND_PAYOUT_MERKLE,
  ROUND_PAYOUT_MERKLE_OLD,
} from "common";
import { getExplorerPageTitle } from "../getExplorerPageTitle";
import { RoundStatus } from "../../hooks/useFilterRounds";

describe("getExplorerPageTitle", () => {
  it("Returns All when none are selected", async () => {
    expect(getExplorerPageTitle({ status: "", type: "", network: "" })).toEqual(
      "All rounds"
    );
  });
  it("Returns the correct title", () => {
    expect(
      getExplorerPageTitle({
        status: "",
        type: ROUND_PAYOUT_MERKLE,
        network: "",
      })
    ).toEqual("Quadratic Funding rounds");
    expect(
      getExplorerPageTitle({
        status: "",
        type: ROUND_PAYOUT_DIRECT,
        network: "",
      })
    ).toEqual("Direct Grants rounds");
    expect(
      getExplorerPageTitle({
        status: RoundStatus.taking_applications,
        type: "",
        network: "",
      })
    ).toEqual("Rounds taking applications");
    expect(
      getExplorerPageTitle({
        status: RoundStatus.active,
        type: "",
        network: "",
      })
    ).toEqual("Active rounds");
    expect(
      getExplorerPageTitle({
        status: "",
        type: "",
        network: "1",
      })
    ).toEqual("Rounds on Ethereum");
  });
  it("Returns multiple if many are selected", () => {
    expect(
      getExplorerPageTitle({
        status: "active,finished",
        type: ROUND_PAYOUT_MERKLE_OLD,
        network: "",
      })
    ).toEqual("Multiple filters");
  });
});
