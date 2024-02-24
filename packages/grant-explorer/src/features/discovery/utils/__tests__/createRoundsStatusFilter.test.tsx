import { createRoundsStatusFilter } from "../createRoundsStatusFilter";

describe("createRoundsStatusFilter", () => {
  it("single selected filter", async () => {
    const filter = createRoundsStatusFilter("active");

    expect(filter[0].donationsStartTime?.lessThan).toBeDefined();
    expect(filter[0].donationsEndTime?.greaterThan).toBeDefined();
    expect(filter[0].donationsEndTime?.lessThan).toBeDefined();
  });
  it("multi selected filters", async () => {
    const filter = createRoundsStatusFilter(
      "active,taking_applications,finished"
    );
    expect(filter.length).toBe(3);
  });
});
