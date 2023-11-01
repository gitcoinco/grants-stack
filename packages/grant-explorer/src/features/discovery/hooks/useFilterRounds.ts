import { useState } from "react";
import {
  createTimestamp,
  getActiveChainIds,
  useRounds,
} from "../../api/rounds";
import { FilterProps } from "../FilterDropdown";
import { SortProps } from "../SortDropdown";

type Filter = SortProps & FilterProps;

export function useFilterRounds(filter: Filter) {
  const [currentTimestamp] = useState(createTimestamp());
  const chainIds = getActiveChainIds();
  const filterChains = filter.network?.split(",").filter(Boolean) ?? [];
  const strategyNames = filter.type?.split(",").filter(Boolean) ?? [];

  return useRounds(
    {
      orderBy: filter.orderBy || "createdAt",
      orderDirection: filter.orderDirection || "desc",
      where: {
        roundStartTime_gt: currentTimestamp,
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
