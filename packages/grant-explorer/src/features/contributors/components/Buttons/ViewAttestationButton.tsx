import { Button } from "common/src/styles";

export function ViewAttestationButton({
  onClick = () => null,
  disabled = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      className={`px-4 py-1 rounded-[8px] bg-white font-medium font-mono text-base text-black h-8 whitespace-nowrap border-[1px] border-grey-100 disabled:bg-grey-100 disabled:text-[#979998] disabled:border-grey-100`}
      disabled={disabled}
      onClick={onClick}
      data-testid="mint-donation-button"
    >
      View attestation
    </Button>
  );
}
