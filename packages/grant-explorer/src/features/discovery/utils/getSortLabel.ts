import { SORT_OPTIONS } from "../SortDropdown";
import { RoundSortUiOption, RoundSortParams } from "../hooks/useFilterRounds";

export function getSortLabel({
  orderBy = "",
  orderDirection = "",
}: Partial<RoundSortParams>): RoundSortUiOption {
  return (
    SORT_OPTIONS.find(
      (item) =>
        item.orderBy === orderBy && item.orderDirection === orderDirection
    ) ?? { label: "", orderBy: "", orderDirection: "" }
  );
}
