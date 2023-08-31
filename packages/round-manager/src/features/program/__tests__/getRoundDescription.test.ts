import { Round } from "../../api/types";
import { getRoundDescriptionStatus } from "../getRoundDescriptionStatus";
import moment from "moment";

type TestRound = Pick<
  Round,
  | "roundStartTime"
  | "roundEndTime"
  | "applicationsStartTime"
  | "applicationsEndTime"
>;

describe("getRoundDescriptionStatus", () => {
  const baseRound: TestRound = {
    applicationsStartTime: moment().subtract(10, "days").toDate(),
    applicationsEndTime: moment().subtract(9, "days").toDate(),
    roundStartTime: moment().subtract(8, "days").toDate(),
    roundEndTime: moment().subtract(7, "days").toDate(),
  };

  it('should return "Round ended"', () => {
    const round = {
      ...baseRound,
    };
    expect(getRoundDescriptionStatus(round)).toBe("Round ended");
  });

  it('should return "Round in progress"', () => {
    const round = {
      ...baseRound,
      roundEndTime: moment().add(1, "day").toDate(),
    };
    expect(getRoundDescriptionStatus(round)).toBe("Round in progress");
  });

  it('should return "Applications ended"', () => {
    const round = {
      ...baseRound,
      applicationsEndTime: moment().subtract(1, "day").toDate(),
      roundStartTime: moment().add(1, "day").toDate(),
      roundEndTime: moment().add(2, "day").toDate(),
    };
    expect(getRoundDescriptionStatus(round)).toBe("Applications ended");
  });

  it('should return "Applications in progress"', () => {
    const round = {
      ...baseRound,
      applicationsStartTime: moment().subtract(2, "day").toDate(),
      applicationsEndTime: moment().add(1, "day").toDate(),
      roundStartTime: moment().add(2, "day").toDate(),
      roundEndTime: moment().add(3, "day").toDate(),
    };
    expect(getRoundDescriptionStatus(round)).toBe("Applications in progress");
  });

  it('should return "Applications not started"', () => {
    const round = {
      ...baseRound,
      applicationsStartTime: moment().add(1, "day").toDate(),
      applicationsEndTime: moment().add(2, "day").toDate(),
      roundStartTime: moment().add(3, "day").toDate(),
      roundEndTime: moment().add(4, "day").toDate(),
    };
    expect(getRoundDescriptionStatus(round)).toBe("Applications not started");
  });
});
