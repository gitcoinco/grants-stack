import { Button } from "common/src/styles";

export function MintDonationButton({
  disabled = false,
  onClick = () => null,
}: {
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex align-center justify-center border-[1px] rounded-[8px] ${disabled ? "bg-grey-100 border-grey-100" : "bg-rainbow-gradient border-transparent"}`}
    >
      <Button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`px-4 py-1 rounded-[8px] bg-white font-medium font-mono text-base text-black h-8 whitespace-nowrap border-[1px] border-transparent disabled:bg-grey-100 disabled:text-[#979998] disabled:border-grey-100`}
        data-testid="mint-donation-button"
      >
        Mint donation
      </Button>
    </div>
  );
}
