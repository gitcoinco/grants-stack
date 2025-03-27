import { PropsWithChildren } from "react";

const STAKING_BANNER_TITLE =
  "🔥 Boost grants, earn rewards, and shape the round!";
const STAKING_BANNER_TEXT =
  "Stake GTC during GG23 to upvote your favorite grants and increase their visibility in the round. The more you stake, the higher they rank—and the more rewards you can claim from the 3% rewards pool!";

export const StakingBanner = ({ children }: PropsWithChildren) => {
  return (
    <div className="bg-[#F2FBF8] rounded-3xl p-6 flex flex-col xl:flex-row items-center justify-between w-full gap-4">
      <div className="flex flex-col gap-4 font-sans text-black max-w-[609px]">
        <h3 className="text-2xl font-medium">{STAKING_BANNER_TITLE}</h3>
        <p className="text-base/[1.75rem] font-normal">{STAKING_BANNER_TEXT}</p>
      </div>
      {children}
    </div>
  );
};
