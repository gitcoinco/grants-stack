import {
  RoundFilterUiOption,
  RoundFilterParams,
} from "../hooks/useFilterRounds";
import { FILTER_OPTIONS } from "../FilterDropdown";

const hasManySelections = (arr: string[]) => arr.filter(Boolean).length > 1;
const findSelection = (value: string, arr: string[]) =>
  arr.map((item) => item.split(",").filter(Boolean).join(",")).includes(value);

/*
Find the label to display from the current filter.
- All - nothing selected
- Multiple - more than 1 selected
- Selected - 1 selected
*/

export function getFilterLabel({
  status = "",
  network = "",
  type = "",
}: Partial<RoundFilterParams> = {}): RoundFilterUiOption {
  const selectedFilters = Object.values({ status, network, type }).filter(
    Boolean
  );

  // First check if many selections have been made in the filter.
  // This can be either in same category or across several.
  if (
    selectedFilters.some(
      (currentFilter) =>
        // Has many selections in same category or across several
        hasManySelections(currentFilter?.split(",")) ||
        hasManySelections(selectedFilters)
    )
  ) {
    return { label: "Multiple", value: "multiple" };
  }

  const selected = FILTER_OPTIONS.reduce<RoundFilterUiOption>(
    (label, { children }) => {
      // Search for a selected filter
      const match = children?.find((child) =>
        findSelection(child.value, selectedFilters)
      );
      // Return the match if found
      return match || label;
    },
    // Default to "All"
    { label: "All", value: "" }
  );

  return selected;
}
