import { TimestampVariables } from "../../api/rounds";
import { FilterStatus } from "../FilterDropdown";

const createTimestamp = (timestamp = 0) => {
  const NOW_IN_SECONDS = Date.now() / 1000;
  return Math.floor(NOW_IN_SECONDS + timestamp).toString();
};

const ONE_DAY_IN_SECONDS = 3600 * 24;
const ONE_YEAR_IN_SECONDS = ONE_DAY_IN_SECONDS * 365;

function getStatusFilter(status: string): TimestampVariables {
  const currentTimestamp = createTimestamp();
  const futureTimestamp = createTimestamp(ONE_YEAR_IN_SECONDS);

  switch (status) {
    case FilterStatus.active:
      return {
        // Round must have started and not ended yet
        roundStartTime_lt: currentTimestamp,
        roundEndTime_gt: currentTimestamp,
        roundEndTime_lt: futureTimestamp,
      };
    case FilterStatus.taking_applications:
      return {
        applicationsStartTime_lte: currentTimestamp,
        applicationsEndTime_gte: currentTimestamp,
      };

    case FilterStatus.finished:
      return {
        roundEndTime_lt: currentTimestamp,
      };
    case FilterStatus.ending_soon:
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

export function createRoundsStatusFilter(status: string): {
  or: TimestampVariables[];
} {
  // Default to all filters
  const selectedFilters =
    status ||
    [
      FilterStatus.active,
      FilterStatus.taking_applications,
      FilterStatus.finished,
    ].join(",");

  // Build a filter object: { or: [activeFilter, takingApplicationsFilter] }
  return {
    or: selectedFilters
      ?.split(",")
      .filter(Boolean)
      .reduce(
        (filters, key) => filters.concat(getStatusFilter(key)),
        [] as TimestampVariables[]
      ),
  };
}
