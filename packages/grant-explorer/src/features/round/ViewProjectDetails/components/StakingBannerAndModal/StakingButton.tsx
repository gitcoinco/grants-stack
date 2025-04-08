import { Button } from "common/src/styles";

const STAKING_BUTTON_TEXT = "Stake on this project";
const STAKING_BUTTON_TEXT_ROUND_VIEW = "Stake GTC";
const STAKING_BUTTON_TEXT_CLAIM_PERIOD = "Claim rewards";
export const StakingButton = ({
  onClick,
  isRoundView,
  isClaimPeriod,
}: {
  onClick?: () => void;
  isRoundView?: boolean;
  isClaimPeriod?: boolean;
}) => {
  return (
    <Button
      className={`text-white text-sm font-medium px-4 py-2 leading-normal rounded-lg inline-flex justify-center items-center gap-2 font-mono ${isClaimPeriod ? "bg-[#5C35CC]" : "bg-[#22635A]"}`}
      onClick={onClick}
    >
      {isClaimPeriod
        ? STAKING_BUTTON_TEXT_CLAIM_PERIOD
        : isRoundView
          ? STAKING_BUTTON_TEXT_ROUND_VIEW
          : STAKING_BUTTON_TEXT}
    </Button>
  );
};
