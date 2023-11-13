import { Link, useSearchParams } from "react-router-dom";
import { RoundsVariables } from "../api/rounds";
import { Dropdown, DropdownItem } from "../common/Dropdown";
import { parseFilterParams } from "./hooks/useFilterRounds";
import { toQueryString } from "./RoundsFilter";
import { getSortLabel } from "./utils/getSortLabel";

type Option = {
  label: string;
  orderBy: RoundsVariables["orderBy"] | "";
  orderDirection: RoundsVariables["orderDirection"] | "";
};
export const sortOptions: Option[] = [
  {
    label: "All",
    orderBy: "",
    orderDirection: "",
  },
  {
    label: "Newest",
    orderBy: "createdAt",
    orderDirection: "desc",
  },
  {
    label: "Oldest",
    orderBy: "createdAt",
    orderDirection: "asc",
  },
  {
    label: "Round end (earliest)",
    orderBy: "roundEndTime",
    orderDirection: "asc",
  },
  {
    label: "Round end (latest)",
    orderBy: "roundEndTime",
    orderDirection: "desc",
  } /*
  {
    label: "Highest contributor count",
    orderBy: "<unknown>",
    orderDirection: "asc",
  },
  {
    label: "Lowest contributor count",
    orderBy: "<unknown>",
    orderDirection: "desc",
  },
  {
    label: "Highest project count",
    orderBy: "projects",
    orderDirection: "asc",
  },
  {
    label: "Lowest project count",
    orderBy: "projects",
    orderDirection: "desc",
  },*/,
  {
    label: "Matching funds: high to low",
    orderBy: "matchAmount",
    orderDirection: "desc",
  },
  {
    label: "Matching funds: low to high",
    orderBy: "matchAmount",
    orderDirection: "asc",
  },
];
export type SortOption = (typeof sortOptions)[number];

export type SortProps = {
  orderBy: SortOption["orderBy"];
  orderDirection: SortOption["orderDirection"];
};

export function SortDropdown() {
  const [params] = useSearchParams();
  const { orderBy = "", orderDirection = "" } = parseFilterParams(params);

  const selected = getSortLabel({ orderBy, orderDirection });

  return (
    <Dropdown
      label={selected?.label}
      options={sortOptions}
      renderItem={({ label, orderBy, orderDirection, close }) => (
        <DropdownItem
          $as={Link}
          // Merge search params
          to={`/rounds?${toQueryString({
            ...Object.fromEntries(params),
            orderBy,
            orderDirection,
          })}`}
          preventScrollReset
          onClick={close}
        >
          {label}
        </DropdownItem>
      )}
    ></Dropdown>
  );
}
