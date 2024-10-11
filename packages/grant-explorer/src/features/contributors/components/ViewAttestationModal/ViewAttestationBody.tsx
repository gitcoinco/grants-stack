import React from "react";
import { ShareButtons } from "../../../common/ShareButtons";
import { RainbowBorderButton } from "../Buttons";
import { ViewAttestationImage } from "./ViewAttestationImage";

export type ViewAttestationBodyProps = {
  impactImageCid?: string;
  onViewTransaction?: () => void;
};

export function ViewAttestationBody({
  impactImageCid,
  onViewTransaction,
}: ViewAttestationBodyProps) {
  const title = "Your donation impact";

  return (
    <div className="flex flex-col items-center gap-6 mx-auto w-full h-full overflow-x-auto max-w-full md:w-[625px]">
      <h2 className="text-black text-3xl sm:text-4xl md:text-5xl/[52px] text-center font-medium font-sans  text-[clamp(1.5rem, 2vw + 1rem, 2rem)]">
        {title}
      </h2>
      <RainbowBorderButton
        dataTestId="view-transaction-button"
        onClick={onViewTransaction}
      >
        View transaction
      </RainbowBorderButton>
      <ViewAttestationImage impactImageCid={impactImageCid} />
      <ShareButtons />
    </div>
  );
}
