import { getRoundEndedText } from "../../RoundDaysLeft";

describe("getRoundEndedText", () => {
  it("Ends in x days", async () => {
    expect(getRoundEndedText(1, true)).toEqual(`1 day left in round`);
    expect(getRoundEndedText(10, true)).toEqual(`10 days left in round`);
  });
  it("Ends today", async () => {
    expect(getRoundEndedText(0, true)).toEqual(`Ends today`);
  });
  it("Ended x days ago", async () => {
    expect(getRoundEndedText(-1, true)).toEqual(`Ended 1 day ago`);
    expect(getRoundEndedText(-10, true)).toEqual(`Ended 10 days ago`);
  });
  it("No end time", async () => {
    expect(getRoundEndedText(-1, false)).toEqual(`No end time`);
    expect(getRoundEndedText(10, false)).toEqual(`No end time`);
  });
});
