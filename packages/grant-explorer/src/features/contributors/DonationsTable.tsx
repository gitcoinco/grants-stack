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
import {
  BoltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/react";

export function DonationsTable(props: {
  contributions: Contribution[];
  tokens: Record<string, VotingToken>;
  activeRound: boolean;
}) {
  return (
    <>
      <TableHeader />
      <RoundsTableWithAccordian
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

function RoundsTableWithAccordian(props: {
  contributions: Contribution[];
  tokens: Record<string, VotingToken>;
  activeRound: boolean;
}) {
  // 1. Sort contributions by round
  const contributionsByRound =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props.contributions.reduce((acc: any, contribution) => {
      const roundId = contribution.roundId;
      if (acc[roundId]) {
        acc[roundId].push(contribution);
      } else {
        acc[roundId] = [contribution];
      }
      return acc;
    }, {});

  const sortedRounds = Object.keys(contributionsByRound);

  for (const roundId of sortedRounds) {
    const contributionsForRound = contributionsByRound[roundId];
    console.log(
      `Round ID: ${roundId} - Contributions: ${contributionsForRound.length}`,
      `Contribution: ${contributionsForRound[0].amountInUsd.toFixed(2)}`
    );

    return (
      <>
        <Accordion className="w-full" allowToggle allowMultiple={true}>
          <AccordionItem>
            <h2>
              <AccordionButton _expanded={{ bg: "white", color: "black" }}>
                <Table
                  activeRound={props.activeRound}
                  contributions={props.contributions}
                  tokens={props.tokens}
                />
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <InnerTable
                activeRound={props.activeRound}
                contributions={contributionsForRound}
                tokens={props.tokens}
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </>
    );
  }
}

function TableHeader() {
  return (
    <table className="w-11/12 text-left mx-8">
      <thead className="font-sans text-lg">
        <tr>
          <th className=" lg:pr-16 w-1/3 lg:w-1/3">Round</th>
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
    </table>
  );
}

function InnerTable(props: {
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
                  <th>Project</th>
                  <th>Donation</th>
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
                          <td className="py-4 pr-2 lg:pr-16 w-1/3 lg:w-1/2">
                            <div className="flex items-center">
                              <div className="flex flex-col sm:flex-row">
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
                          {/* Display donations */}
                          <td className="py-4 truncate lg:pr-16">
                            <span className="font-bold">
                              {formattedAmount}{" "}
                            </span>
                            <span className="text-grey-400">
                              / ${contribution.amountInUsd.toFixed(2)}
                            </span>
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

function Table(props: {
  contributions: Contribution[];
  tokens: Record<string, VotingToken>;
  activeRound: boolean;
}) {
  return (
    <table className="w-full text-left">
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
                <tr key={contribution.id}>
                  <td className="py-4 pr-2 lg:pr-16 w-1/3 lg:w-1/3">
                    <div className="flex items-center">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex items-center">
                          {/* Network Icon */}
                          <img
                            className="w-4 h-4 mr-2"
                            src={CHAINS[contribution.chainId as ChainId]?.logo}
                            alt="Round Chain Logo"
                          />
                          {/* Link to the round */}
                          <Link
                            className={`underline inline-block lg:pr-2 lg:max-w-[200px] max-w-[75px] 2xl:max-w-fit truncate`}
                            title={contribution.round.roundMetadata.name}
                            to={`/round/${
                              contribution.chainId
                            }/${contribution.roundId.toLowerCase()}`}
                            target="_blank"
                          >
                            {contribution.round.roundMetadata.name}
                          </Link>
                        </div>
                      </div>
                    </div>
                    {/* Todo: display contribution timestamp */}
                    <div className="text-sm text-gray-500">
                      {(Math.random() * 100).toFixed(0)} mins ago
                    </div>
                  </td>
                  {/* Display donations */}
                  <td className="py-4 truncate lg:pr-16 w-1/3">
                    <span className="font-bold">{formattedAmount} </span>
                    <span className="text-grey-400">
                      / ${contribution.amountInUsd.toFixed(2)}
                    </span>
                  </td>
                  {/* Display the matching amounts */}
                  {/* todo: update to actual matching amounts */}
                  <td className="py-4 truncate lg:pr-16">
                    <BoltIcon
                      className={"w-4 h-4 inline mb-1 mr-1 text-teal-500"}
                    />
                    <span className="font-bold">~{formattedAmount} </span>
                    <span className="text-grey-400">
                      / ~${contribution.amountInUsd.toFixed(2)}
                    </span>
                  </td>
                  {/* Transaction Button */}
                  <td className="py-4 truncate">
                    <div className="flex flex-auto items-center">
                      <TransactionButton
                        chainId={contribution.chainId}
                        txHash={contribution.transactionHash}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
      </tbody>
    </table>
  );
}
