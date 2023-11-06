import { SortOption, SortProps, sortOptions } from "../SortDropdown";

export function getSortLabel({
  orderBy = "",
  orderDirection = "",
}: Partial<SortProps>): SortOption {
  return (
    sortOptions.find(
      (item) =>
        item.orderBy === orderBy && item.orderDirection === orderDirection
    ) ?? { label: "", orderBy: "", orderDirection: "" }
  );
}
