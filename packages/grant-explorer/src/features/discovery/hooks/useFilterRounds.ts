import { useMemo } from "react";
import {
  TimestampVariables,
  getActiveChainIds,
  useRounds,
} from "../../api/rounds";
import { FilterProps, FilterStatus } from "../FilterDropdown";
import { SortProps } from "../SortDropdown";

type Filter = SortProps & FilterProps;

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
        roundStartTime_gt: currentTimestamp,
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
      return {
        roundStartTime_gt: currentTimestamp,
        roundEndTime_lt: futureTimestamp,
      };
  }
}
export function createRoundsStatusFilter(
  status: string = FilterStatus.active
): TimestampVariables {
  // Merge the status filters
  return status
    ?.split(",")
    .filter(Boolean)
    .reduce((filters, key) => {
      return {
        ...filters,
        ...getStatusFilter(key),
      };
    }, {});
}

export function useFilterRounds(filter: Filter) {
  const chainIds = getActiveChainIds();
  const statusFilter = useMemo(
    () => createRoundsStatusFilter(filter.status),
    [filter.status]
  );
  const filterChains = filter.network?.split(",").filter(Boolean) ?? [];
  const strategyNames = filter.type?.split(",").filter(Boolean) ?? [];

  return useRounds(
    {
      orderBy: filter.orderBy || "createdAt",
      orderDirection: filter.orderDirection || "desc",
      where: {
        ...statusFilter,
        payoutStrategy_: strategyNames.length
          ? { strategyName_in: strategyNames }
          : undefined,
      },
    },
    // If no network filters have been set, query all chains
    !filterChains.length
      ? chainIds
      : chainIds.filter((id) => filterChains.includes(String(id)))
  );
}

export function parseFilterParams(
  params: URLSearchParams
): FilterProps & SortProps {
  // Is there another way to type { orderBy: string } into { orderBy: "createdAt" | "matchAmount" | ...} ?
  const filter = Object.fromEntries(params) as SortProps & FilterProps;

  return filter;
}
