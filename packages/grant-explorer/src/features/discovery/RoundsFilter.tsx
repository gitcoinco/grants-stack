import { SortDropdown, type SortProps } from "./SortDropdown";
import { FilterDropdown, type FilterProps } from "./FilterDropdown";

type Filter = SortProps & FilterProps;

export function RoundsFilter() {
  return (
    <div className="md:flex gap-4 font-mono text-sm">
      <div className="flex gap-2 items-center">
        <div>Sort by</div>
        <SortDropdown />
      </div>
      <div className="flex gap-2 items-center">
        <div>Filter by</div>
        <FilterDropdown />
      </div>
    </div>
  );
}

export const toQueryString = (filterParams: Partial<Filter> = {}) =>
  new URLSearchParams(filterParams).toString();
