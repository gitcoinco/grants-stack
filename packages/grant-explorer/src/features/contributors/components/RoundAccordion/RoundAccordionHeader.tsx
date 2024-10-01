import { Link } from "react-router-dom";

import { formatTimeAgo } from "../../utils/time";

export function RoundAccordionHeader({
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
    <table className="w-full text-left font-sans">
      <tbody>
        <tr>
          <td className="py-4 pr-2 w-2/5">
            <div className="flex items-center">
              <div className="flex flex-col sm:flex-row">
                <div className="flex items-center">
                  {/* Network Icon */}
                  <img
                    className="w-4 h-4 mr-1"
                    src={chainLogo}
                    alt="Round Chain Logo"
                  />
                  {/* Link to the round */}
                  <Link
                    className={`underline inline-block lg:pr-2 lg:max-w-[200px] max-w-[75px] 2xl:max-w-fit truncate`}
                    title={roundName}
                    to={`/round/${chainId}/${roundId.toLowerCase()}`}
                    target="_blank"
                  >
                    {roundName}
                  </Link>
                </div>
              </div>
            </div>
            {/* Display contribution timestamp */}
            <div className="text-sm text-gray-500 mt-1">
              {formatTimeAgo(Number(lastUpdated))}
            </div>
          </td>
          {/* Display donations */}
          <td className="py-4 truncate w-2/5 pl-8">
            <span className="font-bold">{formattedAmount} </span>
            <span className="text-grey-400">
              / ${totalContributionAmountInUsd.toFixed(2)}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
