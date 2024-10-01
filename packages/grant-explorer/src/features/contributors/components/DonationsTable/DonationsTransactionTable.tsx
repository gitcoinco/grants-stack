import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

import { getTxBlockExplorerLink } from "common";

import { RoundAccordion } from "../RoundAccordion";
import { TableHeader } from "./TableHeader";

import { ContributionsByRoundId } from "../../types";
import { truncateAddress } from "../../utils/address";

export function DonationsTransactionTable({
  transactionHash,
  contributions = {},
}: {
  transactionHash: string;
  contributions?: ContributionsByRoundId;
}) {
  const roundIds = Object.keys(contributions);
  const nRounds = roundIds.length;

  if (nRounds === 0) return null;

  const transactionChainId = contributions[roundIds[0]][0].chainId;

  const transactionLink = getTxBlockExplorerLink(
    transactionChainId,
    transactionHash
  );
  const parcialTransactionHash = truncateAddress(transactionHash, 5);

  return (
    <div>
      <div className="bg-grey-75 rounded-lg px-3 py-4">
        <h1 className="font-medium font-mono text-xl">
          <a target={"_blank"} href={transactionLink}>
            {`Transaction #${parcialTransactionHash}`}
            <ArrowTopRightOnSquareIcon className="mb-1 h-5 inline ml-2" />
          </a>
          {` - ${nRounds} rounds`}
        </h1>
      </div>
      <TableHeader />
      {roundIds.map((roundId) => (
        <RoundAccordion contributions={contributions[roundId]} />
      ))}
    </div>
  );
}
