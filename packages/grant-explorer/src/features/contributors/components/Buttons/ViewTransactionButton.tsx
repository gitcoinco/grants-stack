import { RainbowBorderButton } from "./RainbowBorderButton";

export type ViewTransactionButtonProps = {
  disabled?: boolean;
  onClick?: () => void;
};

export function ViewTransactionButton({
  onClick,
  disabled,
}: ViewTransactionButtonProps) {
  return (
    <RainbowBorderButton
      dataTestId="view-transaction-button"
      disabled={disabled}
      onClick={onClick}
    >
      View attestation
    </RainbowBorderButton>
  );
}
