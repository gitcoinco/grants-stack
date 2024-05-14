import { createRoundsStatusFilter } from "../createRoundsStatusFilter";

describe("createRoundsStatusFilter", () => {
  it("single selected filter", async () => {
    const filter = createRoundsStatusFilter("active");

    expect(filter[0].donationsStartTime?.lessThan).toBeDefined();
    expect(filter[0]?.or!.length).toBe(2);
    expect(filter[0]!.or![0]!.donationsEndTime?.greaterThan).toBeDefined(); // Added null check
    expect(filter[0]!.or![1]!.donationsEndTime?.isNull).toBeDefined();
  });
  it("multi selected filters", async () => {
    const filter = createRoundsStatusFilter(
      "active,taking_applications,finished"
    );
    expect(filter.length).toBe(3);
  });
});
