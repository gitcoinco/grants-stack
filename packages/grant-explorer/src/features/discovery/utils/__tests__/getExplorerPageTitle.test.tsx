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
        type: "allov2.DonationVotingMerkleDistributionDirectTransferStrategy",
        network: "",
      })
    ).toEqual("Quadratic funding");
    expect(
      getExplorerPageTitle({
        status: "",
        type: "allov2.DirectGrantsSimpleStrategy",
        network: "",
      })
    ).toEqual("Direct grants");
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
        type: "allov2.DonationVotingMerkleDistributionDirectTransferStrategy",
        network: "",
      })
    ).toEqual("Multiple filters");
  });
});
