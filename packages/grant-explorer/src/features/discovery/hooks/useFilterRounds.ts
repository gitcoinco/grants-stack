import { useMemo } from "react";
import {
  RoundsVariables,
  TimestampVariables,
  getActiveChainIds,
  useRounds,
} from "../../api/rounds";
import { FilterProps } from "../FilterDropdown";
import { SortProps } from "../SortDropdown";
import { createRoundsStatusFilter } from "../utils/createRoundsStatusFilter";

type Filter = SortProps & FilterProps;

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
      where: createRoundWhereFilter(statusFilter, strategyNames),
    },
    // If no network filters have been set, query all chains
    !filterChains.length
      ? chainIds
      : chainIds.filter((id) => filterChains.includes(String(id)))
  );
}
function createRoundWhereFilter(
  statusFilter: TimestampVariables[],
  strategyNames: string[]
): RoundsVariables["where"] {
  const payoutStrategy = strategyNames.length
    ? strategyNames.map((strategyName) => ({ strategyName }))
    : undefined;

  return {
    and: [
      // Find rounds that match both statusFilter and round type
      { or: statusFilter },
      { payoutStrategy_: payoutStrategy ? { or: payoutStrategy } : undefined },
    ],
  };
}

export function parseFilterParams(
  params: URLSearchParams
): FilterProps & SortProps {
  // Is there another way to type { orderBy: string } into { orderBy: "createdAt" | "matchAmount" | ...} ?
  const filter = Object.fromEntries(params) as SortProps & FilterProps;

  return filter;
}
