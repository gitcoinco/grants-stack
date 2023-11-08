import { createRoundsStatusFilter } from "../createRoundsStatusFilter";

describe("createRoundsStatusFilter", () => {
  it("single selected filter", async () => {
    const filter = createRoundsStatusFilter("active");
    expect(filter.roundStartTime_lt).toBeDefined();
    expect(filter.roundEndTime_gt).toBeDefined();
    expect(filter.roundEndTime_lt).toBeDefined();
  });
  it("multi selected filters", async () => {
    const filter = createRoundsStatusFilter(
      "active,taking_applications,finished"
    );
    expect(filter.applicationsEndTime_gte).toBeDefined();
    expect(filter.applicationsStartTime_lte).toBeDefined();
    expect(filter.roundStartTime_lt).toBeDefined();
    expect(filter.roundEndTime_gt).toBeDefined();
    expect(filter.roundEndTime_lt).toBeDefined();
  });
});
