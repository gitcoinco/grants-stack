import { RainbowBorderButton } from "./RainbowBorderButton";

export function MintDonationButton({
  disabled = false,
  onClick = () => null,
}: {
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <RainbowBorderButton
      disabled={disabled}
      onClick={onClick}
      data-testid="mint-donation-button"
    >
      Mint donation
    </RainbowBorderButton>
  );
}
