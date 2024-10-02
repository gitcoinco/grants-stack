import { Link } from "react-router-dom";
import { Hex, formatUnits } from "viem";

import { Contribution } from "data-layer";
import { getTokenByChainIdAndAddress } from "common";

export function RoundAccordionContribution({
  contribution,
}: {
  contribution: Contribution;
}) {
  const { chainId, roundId, applicationId, amount } = contribution;

  const projectName = contribution.application.project.name;
  const amountInUsd = contribution.amountInUsd.toFixed(2);

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
    <div className="flex items-center justify-between px-4 font-modern-era-regular font-normal text-base/[26px]">
      <div className="flex flex-col flex-1">
        <div className="flex items-center">
          {/* Link to the project */}
          <Link
            className={`underline inline-block lg:max-w-[300px] max-w-[75px] 2xl:max-w-fit truncate`}
            title={projectName}
            to={linkToRound}
            target="_blank"
          >
            {projectName}
          </Link>
        </div>
      </div>
      <div className="flex-1 text-center truncate">
        <span className="text-black">{formattedAmount} </span>
        <span className="text-grey-400">/ ${amountInUsd}</span>
      </div>
      <div className="flex-1"></div>
    </div>
  );
}
