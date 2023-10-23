import { Link, useSearchParams } from "react-router-dom";
import { Dropdown, DropdownItem } from "../common/Dropdown";
import { toURL } from "./RoundsFilter";

const sortOptions = [
  {
    label: "All",
    sortBy: "",
    orderBy: "",
  },
  {
    label: "Newest",
    sortBy: "createdAt",
    orderBy: "desc",
  },
  {
    label: "Oldest",
    sortBy: "createdAt",
    orderBy: "asc",
  },
  {
    label: "Round end (earliest)",
    sortBy: "roundEndTime",
    orderBy: "asc",
  },
  {
    label: "Round end (latest)",
    sortBy: "roundEndTime",
    orderBy: "desc",
  },
  {
    label: "Highest contributor count",
    sortBy: "<unknown>",
    orderBy: "asc",
  },
  {
    label: "Lowest contributor count",
    sortBy: "<unknown>",
    orderBy: "desc",
  },
  {
    label: "Highest project count",
    sortBy: "projects",
    orderBy: "asc",
  },
  {
    label: "Lowest project count",
    sortBy: "projects",
    orderBy: "desc",
  },
  {
    label: "Matching funds: high to low",
    sortBy: "matchAmount",
    orderBy: "asc",
  },
  {
    label: "Matching funds: low to high",
    sortBy: "matchAmount",
    orderBy: "desc",
  },
] as const;

type SortOption = (typeof sortOptions)[number];

export type SortProps = {
  sortBy: SortOption["sortBy"];
  orderBy: SortOption["orderBy"];
};

export function SortDropdown({ sortBy, orderBy }: SortProps) {
  // Get existing search params
  const params = Object.fromEntries(useSearchParams()[0]);
  const selected = sortOptions.find(
    (item) => item.sortBy === sortBy && item.orderBy === orderBy
  );
  return (
    <Dropdown label={selected?.label}>
      {sortOptions.map(({ label, sortBy, orderBy }) => (
        <DropdownItem
          $as={Link}
          // Merge search params
          to={`/rounds?${toURL({ ...params, sortBy, orderBy })}`}
        >
          {label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
