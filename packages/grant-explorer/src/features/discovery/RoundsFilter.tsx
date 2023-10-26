import { useSearchParams } from "react-router-dom";
import { SortDropdown, type SortProps } from "./SortDropdown";
import { FilterDropdown, type FilterProps } from "./FilterDropdown";

type Filter = SortProps & FilterProps;

export function RoundsFilter() {
  const params = Object.fromEntries(useSearchParams()[0]);
  const {
    sortBy = "",
    orderBy = "",
    status,
    type = "",
    network = "",
  } = params as Filter;

  return (
    <div className="flex gap-4 font-mono text-sm">
      <div className="flex gap-2 items-center">
        <div>Sort by</div>
        <SortDropdown sortBy={sortBy} orderBy={orderBy} />
      </div>
      <div className="flex gap-2 items-center">
        <div>Filter by</div>
        <FilterDropdown status={status} type={type} network={network} />
      </div>
    </div>
  );
}

export const toQueryString = (filterParams: Partial<Filter> = {}) =>
  new URLSearchParams(filterParams).toString();
