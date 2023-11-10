import { createRoundsStatusFilter } from "../createRoundsStatusFilter";

describe("createRoundsStatusFilter", () => {
  it("single selected filter", async () => {
    const filter = createRoundsStatusFilter("active");

    expect(filter[0].roundStartTime_lt).toBeDefined();
    expect(filter[0].roundEndTime_gt).toBeDefined();
    expect(filter[0].roundEndTime_lt).toBeDefined();
  });
  it("multi selected filters", async () => {
    const filter = createRoundsStatusFilter(
      "active,taking_applications,finished"
    );
    expect(filter.length).toBe(3);
  });
});
