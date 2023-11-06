import { createRoundsStatusFilter } from "../createRoundsStatusFilter";

describe("createRoundsStatusFilter", () => {
  it("single selected filter", async () => {
    const filter = createRoundsStatusFilter("active");
    expect(filter.roundEndTime_lt).toBeDefined();
    expect(filter.roundStartTime_gt).toBeDefined();
  });
  it("multi selected filters", async () => {
    const filter = createRoundsStatusFilter(
      "active,taking_applications,finished"
    );
    expect(filter.applicationsEndTime_gte).toBeDefined();
    expect(filter.applicationsStartTime_lte).toBeDefined();
    expect(filter.roundEndTime_lt).toBeDefined();
    expect(filter.roundStartTime_gt).toBeDefined();
  });
});
