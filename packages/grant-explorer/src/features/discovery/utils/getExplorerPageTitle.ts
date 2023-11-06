import { ROUND_PAYOUT_DIRECT, ROUND_PAYOUT_MERKLE } from "common";
import { FilterProps, FilterStatus } from "../FilterDropdown";
import { getFilterLabel } from "./getFilterLabel";

export function getExplorerPageTitle(filter: FilterProps) {
  const { value, label } = getFilterLabel(filter);

  console.log(value, label);
  switch (value) {
    case "":
      return "All rounds";
    case ROUND_PAYOUT_MERKLE:
      return "Quadratic Funding rounds";
    case ROUND_PAYOUT_DIRECT:
      return "Direct Grants rounds";
    case FilterStatus.active:
      return "Active rounds";
    case FilterStatus.taking_applications:
      return "Rounds taking applications";
    case FilterStatus.finished:
      return "Rounds finished";
    case "multiple":
      return "Multiple filters";
    default:
      return label;
  }
}
