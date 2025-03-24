import { useTokenPrice, TToken } from "common";

import { Round } from "../../api/types";
import { StatCard } from "./StatCard";
import { formatAmount } from "./utils";

export const Stats = ({
  round,
  totalCrowdfunded,
  totalProjects,
  token,
  tokenSymbol,
  totalDonations,
  totalDonors,
  statsLoading,
}: {
  round: Round;
  totalCrowdfunded: number;
  totalProjects: number;
  chainId: number;
  token?: TToken;
  tokenSymbol?: string;
  totalDonations: number;
  totalDonors: number;
  statsLoading: boolean;
}): JSX.Element => {
  const tokenAmount =
    round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable ?? 0;

  const { data: poolTokenPrice } = useTokenPrice(
    token?.redstoneTokenId,
    token?.priceSource
  );

  const matchingPoolUSD = poolTokenPrice
    ? Number(poolTokenPrice) * tokenAmount
    : undefined;
  const matchingCapPercent =
    round.roundMetadata?.quadraticFundingConfig?.matchingCapAmount ?? 0;
  const matchingCapTokenValue = (tokenAmount * matchingCapPercent) / 100;

  return (
    <div className="max-w-5xl m-auto w-full">
      <div className={`xl:grid-cols-3 grid grid-cols-2 gap-2 sm:gap-4`}>
        <StatCard
          statValue={`${formatAmount(tokenAmount, true)} ${tokenSymbol}`}
          secondaryStatValue={`${
            matchingPoolUSD ? `($${formatAmount(matchingPoolUSD ?? 0)})` : ""
          }`}
          statName="Matching Pool"
          isValueLoading={statsLoading}
        />
        <StatCard
          statValue={`$${formatAmount(totalCrowdfunded.toFixed(2))}`}
          statName="Total USD Crowdfunded"
          isValueLoading={statsLoading}
        />
        {!!matchingCapPercent && (
          <StatCard
            statValue={`${matchingCapPercent.toFixed()}% `}
            secondaryStatValue={`(${formatAmount(
              matchingCapTokenValue,
              true
            )} ${tokenSymbol})`}
            statName="Matching Cap"
            isValueLoading={statsLoading}
          />
        )}

        <StatCard
          statValue={formatAmount(totalProjects, true)}
          statName="Total Projects"
          isValueLoading={statsLoading}
        />

        <StatCard
          statValue={formatAmount(totalDonations, true)}
          statName="Total Donations"
          isValueLoading={statsLoading}
        />
        <StatCard
          statValue={formatAmount(totalDonors, true)}
          statName="Total Donors"
          isValueLoading={statsLoading}
        />
      </div>
    </div>
  );
};
