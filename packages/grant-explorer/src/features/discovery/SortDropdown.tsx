import { Link, useSearchParams } from "react-router-dom";
import { Dropdown, DropdownItem } from "../common/Dropdown";
import {
  RoundSortUiOption,
  getRoundSelectionParamsFromUrlParams,
} from "./hooks/useFilterRounds";
import { toQueryString } from "./RoundsFilter";
import { getSortLabel } from "./utils/getSortLabel";

export const SORT_OPTIONS: RoundSortUiOption[] = [
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

export function SortDropdown() {
  const [params] = useSearchParams();
  const { orderBy = "", orderDirection = "" } =
    getRoundSelectionParamsFromUrlParams(params);

  const selected = getSortLabel({ orderBy, orderDirection });

  return (
    <Dropdown
      label={selected?.label}
      options={SORT_OPTIONS}
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
