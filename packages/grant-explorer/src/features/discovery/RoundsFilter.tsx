import { SortDropdown } from "./SortDropdown";
import { FilterDropdown } from "./FilterDropdown";
import { RoundSelectionParams } from "./hooks/useFilterRounds";

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

export const toQueryString = (
  filterParams: Partial<RoundSelectionParams> = {}
): string => new URLSearchParams(filterParams).toString();
