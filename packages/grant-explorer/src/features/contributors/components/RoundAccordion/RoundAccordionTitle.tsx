import { Link } from "react-router-dom";

import { formatTimeAgo } from "../../utils/time";

export function RoundAccordionTitle({
  chainLogo,
  roundName,
  chainId,
  roundId,
  lastUpdated,
  formattedAmount,
  totalContributionAmountInUsd,
}: {
  chainLogo: string;
  roundName: string;
  chainId: number;
  roundId: string;
  lastUpdated: string;
  formattedAmount: string;
  totalContributionAmountInUsd: number;
}) {
  return (
    <div className="w-full flex items-center justify-between font-modern-era-regular font-normal text-base/[26px]">
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center">
          <img
            className="w-4 h-4 mr-1"
            src={chainLogo}
            alt="Round Chain Logo"
          />
          <Link
            className={`underline inline-block truncate`}
            title={roundName}
            to={`/round/${chainId}/${roundId.toLowerCase()}`}
            target="_blank"
          >
            {roundName}
          </Link>
        </div>
        <div className="text-sm text-left text-gray-500">
          {formatTimeAgo(Number(lastUpdated))}
        </div>
      </div>
      <div className="flex-1 text-center truncate">
        <span className="text-black">{formattedAmount} </span>
        <span className="text-grey-400">
          / ${totalContributionAmountInUsd.toFixed(2)}
        </span>
      </div>
      <div className="flex-1"></div>
    </div>
  );
}
