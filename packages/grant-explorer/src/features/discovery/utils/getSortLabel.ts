import { SORT_OPTIONS } from "../SortDropdown";
import { RoundSortParams, RoundSortUiOption } from "../hooks/useFilterRounds";

export function getSortLabel({
  orderBy = "NATURAL",
}: Partial<RoundSortParams>): RoundSortUiOption {
  return (
    SORT_OPTIONS.find((item) => item.orderBy === orderBy) ?? {
      label: "",
      orderBy: "NATURAL",
    }
  );
}
