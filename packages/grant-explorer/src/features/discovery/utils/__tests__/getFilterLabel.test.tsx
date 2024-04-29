import { RoundFilterParams } from "../../hooks/useFilterRounds";
import { getFilterLabel } from "../getFilterLabel";

describe("getFilterLabel", () => {
  it("Returns All when none are selected", async () => {
    expect(getFilterLabel({ status: "", type: "", network: "" }).label).toEqual(
      "All"
    );
    // Make sure it works if filter object is empty also
    expect(getFilterLabel({} as RoundFilterParams).label).toEqual("All");
  });
  it("Returns the label of the item selected (if only one)", async () => {
    expect(
      getFilterLabel({ status: "active", type: "", network: "" }).label
    ).toEqual("Active");
    expect(
      getFilterLabel({ status: "", type: "allov1.QF", network: "" }).label
    ).toEqual("Quadratic funding");
    // Filters out commas
    expect(
      getFilterLabel({ status: "", type: "allov1.Direct", network: "" }).label
    ).toEqual("Direct grants");
  });
  it("Returns Multiple when many are selected from same category", async () => {
    expect(
      getFilterLabel({ status: "active,finished", type: "", network: "" }).label
    ).toEqual("Multiple");
    expect(
      getFilterLabel({
        status: "",
        type: "allov1.Direct,allov1.QF",
        network: "",
      }).label
    ).toEqual("Multiple");
    expect(
      getFilterLabel({ status: "", type: "", network: "1,2" }).label
    ).toEqual("Multiple");
  });
  it("Returns Multiple when many are selected from fifferent category", async () => {
    expect(
      getFilterLabel({ status: "active", type: "allov1.Direct", network: "" })
        .label
    ).toEqual("Multiple");
  });
});
