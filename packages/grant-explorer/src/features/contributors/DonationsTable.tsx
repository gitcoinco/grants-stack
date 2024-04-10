import {
  ChevronRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import ReactTooltip from "react-tooltip";
import { CHAINS } from "../api/utils";
import { Link } from "react-router-dom";
import { TransactionButton } from "./TransactionButton";
import { ChainId, VotingToken } from "common";
import { formatUnits } from "viem";
import { Contribution } from "data-layer";
import { BoltIcon } from "@heroicons/react/24/outline";

export function DonationsTable(props: {
  contributions: Contribution[];
  tokens: Record<string, VotingToken>;
  activeRound: boolean;
}) {
  return (
    <>
      <Table
        activeRound={props.activeRound}
        contributions={props.contributions}
        tokens={props.tokens}
      />
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

export default function Table(props: {
  contributions: Contribution[];
  tokens: Record<string, VotingToken>;
  activeRound: boolean;
}) {
  return (
    <div>
      <div className="mt-4 overflow-hidden">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <table className="w-full text-left">
              <thead className="font-sans text-lg">
                <tr>
                  <th>Round</th>
                  <th>
                    <div className="flex flex-row items-center">
                      <div className="py-4">Total Donation</div>
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
                    </div>
                  </th>
                  <th>
                    <div className="flex flex-row items-center">
                      <div className="py-4">Est. Match Amount</div>
                      <div className="py-4">
                        <InformationCircleIcon
                          data-tip
                          data-background-color="#0E0333"
                          data-for="match-amount-tooltip"
                          className="inline h-4 w-4 ml-2 mr-3"
                          data-testid={"match-amount-tooltip"}
                        />
                        <ReactTooltip
                          id="match-amount-tooltip"
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
                    </div>
                  </th>
                  <th className="text-right">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {props.contributions.length > 0 &&
                  props.contributions
                    .flat()
                    .sort(
                      (a, b) =>
                        (Number(b.timestamp) || Number.MAX_SAFE_INTEGER) -
                        (Number(a.timestamp) || Number.MAX_SAFE_INTEGER)
                    )

                    .map((contribution) => {
                      const tokenId =
                        contribution.tokenAddress.toLowerCase() +
                        "-" +
                        contribution.chainId;
                      const token = props.tokens[tokenId];

                      let formattedAmount = "N/A";

                      if (token) {
                        formattedAmount = `${formatUnits(
                          BigInt(contribution.amount),
                          token.decimal
                        )} ${token.name}`;
                      }

                      return (
                        <tr key={contribution.id} className="">
                          <td className="border-b py-4 pr-2 lg:pr-16 w-1/3 lg:w-1/2">
                            <div className="flex items-center">
                              <div className="flex flex-col sm:flex-row">
                                <div className="flex items-center">
                                  {/* Network Icon */}
                                  <img
                                    className="w-4 h-4 mr-2"
                                    src={
                                      CHAINS[contribution.chainId as ChainId]
                                        ?.logo
                                    }
                                    alt="Round Chain Logo"
                                  />
                                  {/* Link to the round */}
                                  <Link
                                    className={`underline inline-block lg:pr-2 lg:max-w-[200px] max-w-[75px] 2xl:max-w-fit truncate`}
                                    title={
                                      contribution.round.roundMetadata.name
                                    }
                                    to={`/round/${
                                      contribution.chainId
                                    }/${contribution.roundId.toLowerCase()}`}
                                    target="_blank"
                                  >
                                    {contribution.round.roundMetadata.name}
                                  </Link>
                                  <ChevronRightIcon className="h-4 inline lg:mx-2" />
                                </div>
                                {/* Link to the project */}
                                <Link
                                  className={`underline inline-block lg:pr-2 lg:max-w-[300px] max-w-[75px] 2xl:max-w-fit truncate`}
                                  title={contribution.application.project.name}
                                  to={`/round/${
                                    contribution.chainId
                                  }/${contribution.roundId
                                    .toString()
                                    .toLowerCase()}/${
                                    contribution.applicationId
                                  }`}
                                  target="_blank"
                                >
                                  {contribution.application.project.name}
                                </Link>
                              </div>
                            </div>
                            {/* Todo: display contribution timestamp */}
                            <div className="text-sm text-gray-500">
                              {(Math.random() * 100).toFixed(0)} mins ago
                            </div>
                          </td>
                          <td className="border-b py-4 truncate lg:pr-16">
                            <span className="font-bold">
                              {formattedAmount}{" "}
                            </span>
                            <span className="text-grey-400">
                              / ${contribution.amountInUsd.toFixed(2)}
                            </span>
                          </td>
                          {/* todo: update to actual matching amounts */}
                          <td className="border-b py-4 truncate lg:pr-16">
                            <BoltIcon
                              className={
                                "w-4 h-4 inline mb-1 mr-1 text-teal-500"
                              }
                            />
                            <span className="font-bold">
                              {formattedAmount}{" "}
                            </span>
                            <span className="text-grey-400">
                              / ~${contribution.amountInUsd.toFixed(2)}
                            </span>
                          </td>
                          <td className="border-b py-4">
                            <div className="flex flex-auto items-center">
                              <TransactionButton
                                chainId={contribution.chainId}
                                txHash={contribution.transactionHash}
                              />
                              {/* Make this an accordian when multiple projects under the round */}
                              <span className="px-2">^</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
