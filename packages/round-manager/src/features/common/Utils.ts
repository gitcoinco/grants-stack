export const verticalTabStyles = (selected: boolean) =>
  selected
    ? "whitespace-nowrap py-4 px-1 text-sm outline-none"
    : "text-grey-400 hover:text-gray-700 whitespace-nowrap py-4 px-1 font-medium text-sm";

export const horizontalTabStyles = (selected: boolean) =>
  selected
    ? "border-violet-500 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm outline-none"
    : "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm";

export const ROUND_PAYOUT_MERKLE = "MERKLE";
export const ROUND_PAYOUT_DIRECT = "DIRECT";
export const getPayoutRoundDescription = (key: string) => {
  switch (key) {
    case ROUND_PAYOUT_MERKLE:
      return "Quadratic Funding";
      break;
    case ROUND_PAYOUT_DIRECT:
      return "Direct Grant";
      break;
    default:
      return key;
      break;
  }
};
