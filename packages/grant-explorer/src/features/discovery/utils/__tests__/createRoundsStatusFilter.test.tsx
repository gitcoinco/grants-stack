import { createRoundsStatusFilter } from "../../hooks/useFilterRounds";

describe("createRoundsStatusFilter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const date = new Date(2020, 11, 19);
    vi.setSystemTime(date);
  });

  it("single selected filter", async () => {
    expect(createRoundsStatusFilter("active")).toMatchInlineSnapshot(`
      {
        "roundEndTime_lt": "1639868400",
        "roundStartTime_gt": "1608332400",
      }
    `);
  });
  it("multi selected filters", async () => {
    expect(createRoundsStatusFilter("active,taking_applications,finished"))
      .toMatchInlineSnapshot(`
        {
          "applicationsEndTime_gte": "1608332400",
          "applicationsStartTime_lte": "1608332400",
          "roundEndTime_lt": "1608332400",
          "roundStartTime_gt": "1608332400",
        }
      `);
  });
});
