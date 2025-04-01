import { PropsWithChildren } from "react";

const STAKING_BANNER_TITLE =
  "🔥 Boost grants, earn rewards, and shape the round!";

const STAKING_BANNER_TITLE_ROUND_VIEW =
  "🔥 Boost grants, earn rewards, and shape the round—staking is available only during GG23!";

const STAKING_BANNER_TITLE_ROUND_VIEW_CLAIM_PERIOD =
  "🎉 Staking’s a wrap! If you staked GTC, it’s time to claim your rewards!";

const STAKING_BANNER_TITLE_CLAIM_PERIOD =
  "Staking’s done—time to claim your rewards! 🎉";

const STAKING_BANNER_TEXT =
  "Stake GTC during GG23 to upvote your favorite grants and increase their visibility in the round. The more you stake, the higher they rank—and the more rewards you can claim from the 3% rewards pool!";

const STAKING_BANNER_TEXT_CLAIM_PERIOD =
  "Staking is closed! If you staked GTC during GG23, it’s time to claim your rewards from the 3% rewards pool. Thanks for boosting your favorite grants!";

export const StakingBanner = ({
  children,
  isRoundView,
  isClaimPeriod,
}: PropsWithChildren<{ isRoundView?: boolean; isClaimPeriod?: boolean }>) => {
  return (
    <div
      className={`p-6 flex flex-col xl:flex-row items-center w-full gap-6 ${
        isRoundView ? "justify-center" : "rounded-3xl justify-between"
      } ${isClaimPeriod ? "bg-[#F5F4FE]" : "bg-[#F2FBF8]"}`}
    >
      <div
        className={`flex flex-col gap-4 font-sans text-black ${
          isRoundView ? "items-center" : "max-w-[609px]"
        }`}
      >
        <h3 className={`font-medium ${isRoundView ? "text-xl" : "text-2xl"}`}>
          {isRoundView
            ? isClaimPeriod
              ? STAKING_BANNER_TITLE_ROUND_VIEW_CLAIM_PERIOD
              : STAKING_BANNER_TITLE_ROUND_VIEW
            : isClaimPeriod
              ? STAKING_BANNER_TITLE_CLAIM_PERIOD
              : STAKING_BANNER_TITLE}
        </h3>
        {!isRoundView && (
          <p className="text-base/[1.75rem] font-normal">
            {isClaimPeriod
              ? STAKING_BANNER_TEXT_CLAIM_PERIOD
              : STAKING_BANNER_TEXT}
          </p>
        )}
      </div>
      {children}
    </div>
  );
};
