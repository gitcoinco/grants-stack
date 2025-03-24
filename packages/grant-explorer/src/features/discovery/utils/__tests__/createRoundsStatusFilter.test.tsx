import { createRoundsStatusFilter } from "../createRoundsStatusFilter";

describe("createRoundsStatusFilter", () => {
  it("single selected filter", async () => {
    const filter = createRoundsStatusFilter("active");

    expect(filter[0].donationsStartTime?._lt).toBeDefined();
    expect(filter[0]?._or!.length).toBe(2);
    expect(filter[0]!._or![0]!.donationsEndTime?._gt).toBeDefined(); // Added null check
    expect(filter[0]!._or![1]!.donationsEndTime?._isNull).toBeDefined();
  });
  it("multi selected filters", async () => {
    const filter = createRoundsStatusFilter(
      "active,taking_applications,finished"
    );
    expect(filter.length).toBe(3);
  });
});
