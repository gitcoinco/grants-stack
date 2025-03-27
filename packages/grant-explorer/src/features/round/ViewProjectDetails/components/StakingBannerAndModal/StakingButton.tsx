import { Button } from "common/src/styles";

const STAKING_BUTTON_TEXT = "Stake on this project";

export const StakingButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Button
      className="text-white bg-[#22635A] max-h-[40px] font-mono whitespace-nowrap"
      onClick={onClick}
    >
      {STAKING_BUTTON_TEXT}
    </Button>
  );
};
