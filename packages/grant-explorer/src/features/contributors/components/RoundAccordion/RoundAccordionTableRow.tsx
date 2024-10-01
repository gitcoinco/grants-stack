import { Link } from "react-router-dom";
import { Hex, formatUnits } from "viem";

import { Contribution } from "data-layer";
import { getTokenByChainIdAndAddress } from "common";

import { formatTimeAgo } from "../../utils/time";

export function RoundAccordionTableRow({
  contribution,
}: {
  contribution: Contribution;
}) {
  const {
    id: contributionId,
    chainId,
    roundId,
    applicationId,
    timestamp,
    amount,
  } = contribution;

  const projectName = contribution.application.project.name;
  const amountInUsd = contribution.amountInUsd.toFixed(2);

  const timeAgo = formatTimeAgo(Number(timestamp));
  const linkToRound = `/round/${chainId}/${roundId.toString().toLowerCase()}/${applicationId}`;

  let formattedAmount = "N/A";

  const token = getTokenByChainIdAndAddress(
    contribution.chainId,
    contribution.tokenAddress as Hex
  );

  if (token) {
    formattedAmount = `${formatUnits(
      BigInt(amount),
      token.decimals
    )} ${token.code}`;
  }

  return (
    <tr key={contributionId} className="">
      <td className="py-4 pr-2 w-2/5">
        <div className="flex items-center">
          <div className="flex flex-col sm:flex-row">
            {/* Link to the project */}
            <Link
              className={`underline inline-block lg:pr-2 lg:max-w-[300px] max-w-[75px] 2xl:max-w-fit truncate`}
              title={projectName}
              to={linkToRound}
              target="_blank"
            >
              {projectName}
            </Link>
          </div>
        </div>
        {/* Display contribution timestamp */}
        <div className="text-sm text-gray-500 mt-1">{timeAgo}</div>
      </td>
      {/* Display donations */}
      <td className="py-4 truncate lg:pr-16">
        <span className="font-bold">{formattedAmount} </span>
        <span className="text-grey-400">/ ${amountInUsd}</span>
      </td>
    </tr>
  );
}
