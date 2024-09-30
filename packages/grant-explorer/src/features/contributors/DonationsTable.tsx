import { InformationCircleIcon } from "@heroicons/react/24/solid";
import ReactTooltip from "react-tooltip";
import { Link } from "react-router-dom";
import { TransactionButton } from "./TransactionButton";
import { getChainById, getTokenByChainIdAndAddress, getTxBlockExplorerLink, stringToBlobUrl } from "common";
import { Hex, formatUnits } from "viem";
import { Contribution } from "data-layer";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/react";
import { useState } from "react";
import moment from "moment";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

export function DonationsTable(props: {
  contributions: Contribution[];
  activeRound: boolean;
}) {

  console.log("CONTRIBUTIONS", props.contributions);
  
  function groupByTransactionHash(contributions: Contribution[]): Record<string, Contribution[]> {
    return contributions.reduce((grouped: Record<string, Contribution[]>, donation: Contribution) => {
      const { transactionHash } = donation;
      if (!grouped[transactionHash]) {
        grouped[transactionHash] = [];
      }
      grouped[transactionHash].push(donation);
      return grouped;
    }, {});
  }

  const groupedContributionsByTxHash = groupByTransactionHash(props.contributions);
  
  console.log("groupedContributionsByTxHash", groupedContributionsByTxHash);

  return (
    <>
      {props.contributions.length === 0 ? (
        <div className="text-md text-center my-12">
          No Donations found
        </div>
      ) : (
        <>
          {Object.keys(groupedContributionsByTxHash).map((txHash) => (
            <div key={txHash}>

              <div className="bg-grey-75 rounded-lg px-3 py-4">
                <h1 className="font-medium font-mono text-xl">
                  <a
                    target={"_blank"}
                    href={getTxBlockExplorerLink(
                      groupedContributionsByTxHash[txHash][0].chainId,
                      txHash
                    )}
                  >
                    Transaction #{txHash.slice(0, 5) + ".." + txHash.slice(-5)}
                    <ArrowTopRightOnSquareIcon className="mb-1 h-5 inline ml-2" />
                </a>
                </h1>
              </div>
              <TableHeader />
              <RoundsTableWithAccordian
                activeRound={props.activeRound}
                contributions={groupedContributionsByTxHash[txHash]}
              />
            </div>
          ))}
        </>
      )}
    </>
  );
}

function RoundsTableWithAccordian(props: {
  contributions: Contribution[];
  activeRound: boolean;
}) {

  const contributions = props.contributions;

  const [defaultIndex, setDefaultIndex] = useState<
    number | number[] | undefined
  >(undefined);

  return (
    <div className="pb-8">
      {Object.entries(contributions).map(([txnHash, contributionsForTx]) => {
        const sortedContributions = contributions
          .sort(
            (a, b) => b.amountInUsd - a.amountInUsd // Sort by amountInUsd in descending order
          );

        console.log("=============")
        console.log("txnHash", txnHash)
        console.log("SORTED CONTRIBUTIONS", sortedContributions)
        

        return (
          <Accordion
            key={txnHash}
            className="w-full"
            allowMultiple={true}
            defaultIndex={defaultIndex}
            onChange={(index) => {
              setDefaultIndex(index);
            }}
          >
            <AccordionItem
              isDisabled={sortedContributions.length === 0}
            >
              <h2>
                <AccordionButton
                  _expanded={{
                    bg: "white",
                    color: "black",
                  }}
                  _hover={{ bg: "white", color: "black" }}
                  _disabled={{ bg: "white", color: "black" }}
                >
                  <Table
                    activeRound={props.activeRound}
                    contributions={sortedContributions}
                  />
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <InnerTable
                  activeRound={props.activeRound}
                  contributions={sortedContributions}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
}

function TableHeader() {
  return (
    <table className="w-full text-left">
      <thead className="font-sans text-lg">
        <tr>
          <th className="w-2/5 font-medium">Round</th>
          <th className="w-2/5 font-medium">
            <div className="flex flex-row items-center lg:pr-16">
              <div className="py-4">Total Donation</div>
              <div className="py-4">
                <InformationCircleIcon
                  data-tip
                  data-background-color="#0E0333"
                  data-for="donation-tooltip"
                  className="inline h-5 w-5 ml-2 mb-1"
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
          <th></th>
        </tr>
      </thead>
    </table>
  );
}

function InnerTable(props: {
  contributions: Contribution[];
  activeRound: boolean;
}) {
  return (
    <div className="bg-grey-75 rounded-lg p-2 py-1">
      <div className="mt-4 overflow-hidden">
        <div className="mx-auto">
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

                      const token = getTokenByChainIdAndAddress(
                        contribution.chainId,
                        contribution.tokenAddress as Hex
                      );

                      let formattedAmount = "N/A";

                      if (token) {
                        formattedAmount = `${formatUnits(
                          BigInt(contribution.amount),
                          token.decimals
                        )} ${token.code}`;
                      }

                      return (
                        <tr key={contribution.id} className="">
                          <td className="py-4 pr-2 w-2/5">
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
                            {/* Display contribution timestamp */}
                            <div className="text-sm text-gray-500 mt-1">
                              {timeAgo(Number(contribution.timestamp))}
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
  activeRound: boolean;
}) {

  const roundInfo = props.contributions[0];
  const chainId = roundInfo.chainId;
  const chain = getChainById(chainId);

  const chainLogo = stringToBlobUrl(chain.icon);
  const roundName = roundInfo.round.roundMetadata.name;

  const sortedContributions = props.contributions;
  const lastUpdated = sortedContributions[0].timestamp;

  let formattedAmount = "N/A";
  let totalContributionAmountInUsd = 0;
  let totalContributionInMatchingToken = 0;

  // Get the total contribution amount in USD and matching token
  sortedContributions.forEach((contribution) => {
    totalContributionAmountInUsd += contribution.amountInUsd;
    totalContributionInMatchingToken += Number(contribution.amount);
  });

  // Get the formatted amount & token name
  sortedContributions.map((contribution) => {

    const token = getTokenByChainIdAndAddress(
      contribution.chainId,
      contribution.tokenAddress as Hex
    );

    if (token) {
      formattedAmount = `${formatUnits(
        BigInt(totalContributionInMatchingToken),
        token.decimals
      )} ${token.code}`;
    }
  });

  const txnHash = sortedContributions[0].transactionHash;

  return (
    <table className="w-full text-left font-sans">
      <tbody>
        <tr key={roundInfo.id}>
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
                    to={`/round/${chainId}/${roundInfo.roundId.toLowerCase()}`}
                    target="_blank"
                  >
                    {roundName}
                  </Link>
                </div>
              </div>
            </div>
            {/* Display contribution timestamp */}
            <div className="text-sm text-gray-500 mt-1">
              {timeAgo(Number(lastUpdated))}
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

function timeAgo(timestamp: number) {
  return moment(timestamp * 1000).fromNow();
}
