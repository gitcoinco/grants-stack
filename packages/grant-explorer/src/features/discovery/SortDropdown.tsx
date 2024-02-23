import { Link, useSearchParams } from "react-router-dom";
import { Dropdown, DropdownItem } from "../common/Dropdown";
import {
  getRoundSelectionParamsFromUrlParams,
  RoundSortUiOption,
} from "./hooks/useFilterRounds";
import { toQueryString } from "./RoundsFilter";
import { getSortLabel } from "./utils/getSortLabel";

export const SORT_OPTIONS: RoundSortUiOption[] = [
  {
    label: "All",
    orderBy: "NATURAL",
  },
  {
    label: "Newest",
    orderBy: "CREATED_AT_BLOCK_DESC",
  },
  {
    label: "Oldest",
    orderBy: "CREATED_AT_BLOCK_ASC",
  },
  {
    label: "Round end (earliest)",
    orderBy: "DONATIONS_END_TIME_ASC",
  },
  {
    label: "Round end (latest)",
    orderBy: "DONATIONS_END_TIME_DESC",
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
    orderBy: "MATCH_AMOUNT_IN_USD_DESC",
  },
  {
    label: "Matching funds: low to high",
    orderBy: "MATCH_AMOUNT_IN_USD_ASC",
  },
];

export function SortDropdown() {
  const [params] = useSearchParams();
  const { orderBy } = getRoundSelectionParamsFromUrlParams(params);

  const selected = getSortLabel({ orderBy });

  return (
    <Dropdown
      label={selected?.label}
      options={SORT_OPTIONS}
      renderItem={({ label, orderBy, close }) => (
        <DropdownItem
          $as={Link}
          // Merge search params
          to={`/rounds?${toQueryString({
            ...Object.fromEntries(params),
            orderBy,
          })}`}
          preventScrollReset
          onClick={close}
        >
          {label}
        </DropdownItem>
      )}
    />
  );
}
