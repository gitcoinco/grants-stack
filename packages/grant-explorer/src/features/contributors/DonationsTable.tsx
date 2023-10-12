import { DetailedVote as Contribution } from "allo-indexer-client";
import { VotingToken } from "../api/types";
import {
  ChevronRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import ReactTooltip from "react-tooltip";
import { CHAINS } from "../api/utils";
import { Link } from "react-router-dom";
import { TransactionButton } from "./TransactionButton";
import { ChainId } from "common";
import { formatUnits } from "viem";

export function DonationsTable(props: {
  contributions: { chainId: ChainId; data: Contribution[] }[];
  tokens: Record<string, VotingToken>;
  activeRound: boolean;
}) {
  return (
    <>
      <table
        className="border-collapse w-full"
        data-testid="donation-history-table"
      >
        <tr className="text-left text-lg">
          <th className="py-4 w-1/3 lg:w-1/2 font-medium">Project</th>
          <th className="flex flex-row py-4 w-1/3 lg:w-1/4 font-medium">
            <div className="py-4">Donation</div>
            <div className="py-4">
              <InformationCircleIcon
                data-tip
                data-background-color="#0E0333"
                data-for="donation-tooltip"
                className="inline h-4 w-4 ml-2 mr-3"
                data-testid={"donation-tooltip"}
              />
              <ReactTooltip
                id="donation-tooltip"
                place="bottom"
                type="dark"
                effect="solid"
              >
                <p className="text-xs">
                  The displayed amount in USD reflects <br />
                  the value at the time of your donation.
                </p>
              </ReactTooltip>
            </div>
          </th>
          <th className="py-4 text-right w-1/3 lg:w-1/4 font-medium">
            Transaction Information
          </th>
        </tr>
        {props.contributions.length > 0 &&
          props.contributions.map((chainContribution) => {
            const { chainId, data } = chainContribution;
            return data.map((contribution) => {
              const tokenId = contribution.token.toLowerCase() + "-" + chainId;
              const token = props.tokens[tokenId];

              let formattedAmount = "N/A";

              if (token) {
                formattedAmount = `${formatUnits(
                  BigInt(contribution.amount),
                  token.decimal
                )} ${token.name}`;
              }

              return (
                <tr key={contribution.id}>
                  <td className="border-b py-4 pr-2 lg:pr-16 w-1/3 lg:w-1/2">
                    <div className="flex items-center">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex items-center">
                          <img
                            className="w-4 h-4 mr-2"
                            src={CHAINS[chainId]?.logo}
                            alt="Round Chain Logo"
                          />
                          <Link
                            className={`underline inline-block lg:pr-2 lg:max-w-[200px] max-w-[75px] 2xl:max-w-fit truncate`}
                            title={contribution.roundName}
                            to={`/round/${chainId}/${contribution.roundId.toLowerCase()}`}
                            target="_blank"
                          >
                            {contribution.roundName}
                          </Link>
                          <ChevronRightIcon className="h-4 inline lg:mx-2" />
                        </div>
                        <Link
                          className={`underline inline-block lg:pr-2 lg:max-w-[300px] max-w-[75px] 2xl:max-w-fit truncate`}
                          title={contribution.projectTitle}
                          to={`/round/${chainId}/${contribution.roundId.toLowerCase()}/${contribution.roundId.toLowerCase()}-${
                            contribution.applicationId
                          }`}
                          target="_blank"
                        >
                          {contribution.projectTitle}
                        </Link>
                      </div>
                    </div>
                    {/* Todo: display contribution timestamp */}
                    {/* <div className="text-sm text-gray-500">4 mins ago</div> */}
                  </td>
                  <td className="border-b py-4 truncate lg:pr-16 w-1/3 lg:w-1/4">
                    {formattedAmount}
                    <div className="text-md text-gray-500">
                      ${contribution.amountUSD.toFixed(2)}
                    </div>
                  </td>
                  <td className="border-b py-4 lg:pr-12 w-1/3 lg:w-1/4">
                    <div className="flex justify-end">
                      <TransactionButton
                        chainId={chainId}
                        txHash={contribution.transaction}
                      />
                    </div>
                  </td>
                </tr>
              );
            });
          })}
      </table>
      {props.contributions.length === 0 && (
        <div className="text-md mt-2 mb-12">
          {props.activeRound
            ? "Donations made during active rounds will appear here."
            : "Donations made during past rounds will appear here."}
        </div>
      )}
    </>
  );
}
