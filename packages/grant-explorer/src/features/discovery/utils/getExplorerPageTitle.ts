import {
  ROUND_PAYOUT_DIRECT_OLD,
  ROUND_PAYOUT_MERKLE_OLD,
  ROUND_PAYOUT_DIRECT,
  ROUND_PAYOUT_MERKLE,
} from "common";
import { getFilterLabel } from "./getFilterLabel";
import { RoundFilterParams, RoundStatus } from "../hooks/useFilterRounds";

export function getExplorerPageTitle(filter: RoundFilterParams): string {
  const { value, label } = getFilterLabel(filter);

  switch (value) {
    case "":
      return "All rounds";
    case ROUND_PAYOUT_MERKLE_OLD:
    case ROUND_PAYOUT_MERKLE:
      return "Quadratic Funding rounds";
    case ROUND_PAYOUT_DIRECT_OLD:
    case ROUND_PAYOUT_DIRECT:
      return "Direct Grants rounds";
    case RoundStatus.active:
      return "Active rounds";
    case RoundStatus.taking_applications:
      return "Rounds taking applications";
    case RoundStatus.finished:
      return "Rounds finished";
    case RoundStatus.ending_soon:
      return "Ending soon";
    case "multiple":
      return "Multiple filters";
    default:
      return label;
  }
}
