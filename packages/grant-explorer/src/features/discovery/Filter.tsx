import { SortDropdown, type SortProps } from "./SortDropdown";
import {
  FilterDropdown,
  roundFilterOptions,
  projectFilterOptions,
  type FilterProps,
} from "./FilterDropdown";

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
        <FilterDropdown filterOptions={roundFilterOptions} />
      </div>
    </div>
  );
}

export function ProjectsFilter() {
  return (
    <div className="md:flex gap-4 font-mono text-sm">
      <div className="flex gap-2 items-center">
        <div>Filter by</div>
        <FilterDropdown filterOptions={projectFilterOptions} />
      </div>
    </div>
  );
}

export const toQueryString = (filterParams: Partial<Filter> = {}) =>
  new URLSearchParams(filterParams).toString();
