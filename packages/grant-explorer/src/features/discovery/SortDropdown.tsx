import { Link, useSearchParams } from "react-router-dom";
import { Dropdown, DropdownItem } from "../common/Dropdown";
import { toQueryString } from "./RoundsFilter";

type Option = {
  label: string;
  sortBy: string;
  orderBy: string;
};
const sortOptions: Option[] = [
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
];
type SortOption = (typeof sortOptions)[number];

export type SortProps = {
  sortBy: SortOption["sortBy"];
  orderBy: SortOption["orderBy"];
};

export function SortDropdown({ sortBy, orderBy }: SortProps) {
  const [params] = useSearchParams();

  const selected = sortOptions.find(
    (item) => item.sortBy === sortBy && item.orderBy === orderBy
  );
  return (
    <Dropdown
      label={selected?.label}
      options={sortOptions}
      renderItem={({ active, label, sortBy, orderBy }) => (
        <DropdownItem
          active={active}
          $as={Link}
          // Merge search params
          to={`/rounds?${toQueryString({
            ...Object.fromEntries(params),
            sortBy,
            orderBy,
          })}`}
        >
          {label}
        </DropdownItem>
      )}
    ></Dropdown>
  );
}
