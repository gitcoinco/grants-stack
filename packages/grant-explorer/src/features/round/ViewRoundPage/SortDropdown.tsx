import { useSearchParams } from "react-router-dom";
import { Dropdown, DropdownItem } from "../../common/Dropdown";

type SortOption =
  | "TOTAL_STAKED_DESC"
  | "TOTAL_CONTRIBUTORS_DESC"
  | "TOTAL_DONATIONS_DESC"
  | "TOTAL_STAKED_ASC"
  | "TOTAL_CONTRIBUTORS_ASC"
  | "TOTAL_DONATIONS_ASC";

export type RoundApplicationsSortParams = {
  orderBy: SortOption;
};

export const toQueryString = (
  filterParams: Partial<RoundApplicationsSortParams> = {}
): string => new URLSearchParams(filterParams).toString();

interface RoundApplicationsSortOption {
  label: string;
  orderBy: SortOption;
}

export const SORT_OPTIONS: RoundApplicationsSortOption[] = [
  {
    label: "Most GTC Staked",
    orderBy: "TOTAL_STAKED_DESC",
  },
  {
    label: "Most contributors",
    orderBy: "TOTAL_CONTRIBUTORS_DESC",
  },
  {
    label: "Most donations",
    orderBy: "TOTAL_DONATIONS_DESC",
  },
  {
    label: "Least GTC Staked",
    orderBy: "TOTAL_STAKED_ASC",
  },
  {
    label: "Least contributors",
    orderBy: "TOTAL_CONTRIBUTORS_ASC",
  },
  {
    label: "Least donations",
    orderBy: "TOTAL_DONATIONS_ASC",
  },
];

const getSortOptionFromUrlParams = (params: URLSearchParams) => {
  const orderBy = params.get("orderBy");
  return SORT_OPTIONS.find((option) => option.orderBy === orderBy);
};

export function SortDropdown() {
  const [params] = useSearchParams();
  const selected = getSortOptionFromUrlParams(params);
  const pathname = window.location.hash.substring(1);

  return (
    <Dropdown
      labelClassName="text-[14px]/[21px] font-normal text-red-500"
      label={selected?.label ?? "Most GTC Staked"}
      options={SORT_OPTIONS}
      renderItem={({ label, orderBy, close }) => (
        <DropdownItem
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            close();
            // Remove any existing query parameters from pathname
            const basePath = pathname.split("?")[0];
            window.location.hash = `${basePath}?orderBy=${orderBy}`;
          }}
        >
          {label}
        </DropdownItem>
      )}
    />
  );
}
