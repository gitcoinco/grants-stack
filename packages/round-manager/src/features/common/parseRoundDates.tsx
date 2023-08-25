import { formatUTCDateAsISOString, getUTCTime } from "common";
import moment from "moment";
import { maxDateForUint256 } from "../../constants";
import { Round } from "../api/types";

export type RoundDates = Pick<
  Round,
  | "roundStartTime"
  | "roundEndTime"
  | "applicationsStartTime"
  | "applicationsEndTime"
>;

export function parseRoundDates(round: RoundDates) {
  const noEndTime = "No end time";

  return {
    application: {
      iso: {
        start: formatUTCDateAsISOString(round.applicationsStartTime),
        end: moment(round.applicationsEndTime).isSame(maxDateForUint256)
          ? noEndTime
          : formatUTCDateAsISOString(round.applicationsEndTime),
      },
      utc: {
        start: getUTCTime(round.applicationsStartTime),
        end: moment(round.applicationsEndTime).isSame(maxDateForUint256)
          ? ""
          : `(${getUTCTime(round.applicationsEndTime)})`,
      },
    },
    round: {
      iso: {
        start: formatUTCDateAsISOString(round.roundStartTime),
        end: moment(round.roundEndTime).isSame(maxDateForUint256)
          ? noEndTime
          : formatUTCDateAsISOString(round.roundEndTime),
      },
      utc: {
        start: `(${getUTCTime(round.roundStartTime)})`,
        end: moment(round.roundEndTime).isSame(maxDateForUint256)
          ? ""
          : `(${getUTCTime(round.roundEndTime)})`,
      },
    },
  };
}
