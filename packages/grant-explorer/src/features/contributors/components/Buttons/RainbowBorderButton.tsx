import { PropsWithChildren } from "react";
import { Button } from "common/src/styles";

type RainbowBorderButtonProps = {
  disabled?: boolean;
  onClick?: () => void;
  dataTestId?: string;
  children: React.ReactNode;
};

export function RainbowBorderButton({
  disabled = false,
  onClick = () => null,
  dataTestId,
  children,
}: PropsWithChildren<RainbowBorderButtonProps>) {
  return (
    <div
      className={`flex align-center justify-center border hover:shadow-md rounded-[8px] ${disabled ? "bg-grey-100 border-grey-100" : "bg-rainbow-gradient border-transparent"}`}
    >
      <Button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`px-4 py-1 rounded-[8px] bg-white font-medium font-mono text-base text-black h-8 whitespace-nowrap border-[1px] border-transparent disabled:bg-grey-100 disabled:text-[#979998] disabled:border-grey-100`}
        data-testid={dataTestId}
      >
        {children}
      </Button>
    </div>
  );
}
