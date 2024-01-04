import { __deprecated_TimestampVariables } from "../../api/rounds";
import { RoundStatus } from "../hooks/useFilterRounds";

export const createTimestamp = (timestamp = 0) => {
  const NOW_IN_SECONDS = Date.now() / 1000;
  return Math.floor(NOW_IN_SECONDS + timestamp).toString();
};

const ONE_DAY_IN_SECONDS = 3600 * 24;
const ONE_YEAR_IN_SECONDS = ONE_DAY_IN_SECONDS * 365;

function getStatusFilter(status: string): __deprecated_TimestampVariables {
  const currentTimestamp = createTimestamp();
  const futureTimestamp = createTimestamp(ONE_YEAR_IN_SECONDS);

  switch (status) {
    case RoundStatus.active:
      return {
        // Round must have started and not ended yet
        roundStartTime_lt: currentTimestamp,
        roundEndTime_gt: currentTimestamp,
        roundEndTime_lt: futureTimestamp,
      };
    case RoundStatus.taking_applications:
      return {
        applicationsStartTime_lte: currentTimestamp,
        applicationsEndTime_gte: currentTimestamp,
      };

    case RoundStatus.finished:
      return {
        roundEndTime_lt: currentTimestamp,
      };
    case RoundStatus.ending_soon:
      return {
        roundEndTime_gt: currentTimestamp,
        roundEndTime_lt: String(
          Number(currentTimestamp) + ONE_DAY_IN_SECONDS * 30
        ),
      };
    default:
      return {};
  }
}

export function createRoundsStatusFilter(
  status: string
): __deprecated_TimestampVariables[] {
  // Default to all filters
  const selectedFilters =
    status ||
    [
      RoundStatus.active,
      RoundStatus.taking_applications,
      RoundStatus.finished,
    ].join(",");

  // Build a filter array: [activeFilter, takingApplicationsFilter]
  return selectedFilters?.split(",").filter(Boolean).map(getStatusFilter);
}
