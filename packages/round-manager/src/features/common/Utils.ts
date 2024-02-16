import {
  ROUND_PAYOUT_DIRECT,
  ROUND_PAYOUT_MERKLE,
  ROUND_PAYOUT_DIRECT_OLD,
  ROUND_PAYOUT_MERKLE_OLD,
} from "common";

export const verticalTabStyles = (selected: boolean) =>
  selected
    ? "whitespace-nowrap py-4 px-1 text-sm outline-none"
    : "text-grey-400 hover:text-gray-700 whitespace-nowrap py-4 px-1 font-medium text-sm";

export const horizontalTabStyles = (selected: boolean) =>
  selected
    ? "border-violet-500 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm outline-none"
    : "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm";

export const getPayoutRoundDescription = (key: string) => {
  switch (key) {
    case ROUND_PAYOUT_MERKLE:
    case ROUND_PAYOUT_MERKLE_OLD:
      return "Quadratic Funding";
    case ROUND_PAYOUT_DIRECT:
    case ROUND_PAYOUT_DIRECT_OLD:
      return "Direct Grant";
    default:
      return key;
      break;
  }
};
