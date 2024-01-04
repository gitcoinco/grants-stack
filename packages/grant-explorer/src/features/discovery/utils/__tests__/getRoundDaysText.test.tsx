import {
  getRoundDaysText,
  getRoundApplicationDaysText,
} from "../../RoundDaysDetails";

describe("getRoundDaysText", () => {
  it("Starts in x days", () => {
    expect(getRoundDaysText({ roundStartsIn: 1 })).toEqual(`Starts in 1 day`);
    expect(getRoundDaysText({ roundStartsIn: 2 })).toEqual(`Starts in 2 days`);
  });
  it("Ends in x days", () => {
    expect(getRoundDaysText({ roundEndsIn: 1 })).toEqual(`1 day left in round`);
    expect(getRoundDaysText({ roundEndsIn: 10 })).toEqual(
      `10 days left in round`
    );
    expect(getRoundDaysText({ roundStartsIn: -2, roundEndsIn: 1 })).toEqual(
      `1 day left in round`
    );
  });
  it("Ends today", () => {
    expect(getRoundDaysText({ roundEndsIn: 0 })).toEqual(`Ends today`);
  });
  it("Ended x days ago", () => {
    expect(getRoundDaysText({ roundEndsIn: -1 })).toEqual(`Ended 1 day ago`);
    expect(getRoundDaysText({ roundEndsIn: -10 })).toEqual(`Ended 10 days ago`);
  });
  it("No end time", () => {
    expect(getRoundDaysText({})).toEqual(`No round end date`);
  });
});

describe("getRoundApplicationDaysText", () => {
  it("Applications start in x days", () => {
    expect(
      getRoundApplicationDaysText({
        applicationsStartsIn: 1,
        applicationsEndsIn: 2,
      })
    ).toEqual(`Apply in 1 day`);
  });
  it("Applications end in x days", () => {
    expect(getRoundApplicationDaysText({ applicationsEndsIn: 2 })).toEqual(
      `2 days left to apply`
    );
  });
  it("Last day to apply", () => {
    expect(getRoundApplicationDaysText({ applicationsEndsIn: 0 })).toEqual(
      `Last day to apply`
    );
  });
  it("Applications end today", () => {
    expect(getRoundApplicationDaysText({})).toEqual(``);
  });
});
