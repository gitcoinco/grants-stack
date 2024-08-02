import { InformationCircleIcon } from "@heroicons/react/24/solid";
import ReactTooltip from "react-tooltip";
import { Link } from "react-router-dom";
import { getChainById, getTokenByChainIdAndAddress } from "common";
import { Hex, formatUnits } from "viem";
import { Contribution } from "data-layer";
import moment from "moment";
import { TransactionButton } from "./TransactionButton";

export function DirectDonationsTable(props: { contributions: Contribution[] }) {
  return (
    <>
      <TableHeader />
      <Table contributions={props.contributions} />
      {props.contributions.length === 0 && (
        <div className="text-md mt-2 mb-12">
          Direct donations made to projects will appear here.
        </div>
      )}
    </>
  );
}

function TableHeader() {
  return (
    <table className="w-full text-left mx-4">
      <thead className="font-sans text-lg">
        <tr>
          <th className="w-2/5">Project</th>
          <th className="w-2/5">
            <div className="flex flex-row items-center lg:pr-16">
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
          <th className="w-1/5 pl-8">Transaction Information</th>
        </tr>
      </thead>
    </table>
  );
}

function Table(props: { contributions: Contribution[] }) {
  return (
    <div className="rounded-lg p-2 py-1">
      <div className="overflow-hidden">
        <div className="mx-auto">
          <div>
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
                        <tr key={contribution.id} className="border-b">
                          <td className="py-4 lg:px-2 w-2/5">
                            <div className="flex items-center">
                              <div className="flex flex-col sm:flex-row">
                                {/* Link to the project */}
                                <Link
                                  className={`underline inline-block lg:pr-2 lg:max-w-[300px] max-w-[75px] 2xl:max-w-fit truncate`}
                                  title={contribution.projectId.trim()}
                                  to={`/projects/${contribution.projectId}`}
                                  target="_blank"
                                >
                                  {contribution.projectId.trim()}
                                </Link>
                              </div>
                            </div>
                            {/* Display contribution timestamp */}
                            <div className="text-sm text-gray-500">
                              {timeAgo(Number(contribution.timestamp))}
                            </div>
                          </td>
                          {/* Display donations */}
                          <td className="py-4 truncate w-2/5 lg:pl-2">
                            <span className="font-bold">
                              {formattedAmount}{" "}
                            </span>
                            <span className="text-grey-400">
                              / ${contribution.amountInUsd.toFixed(2)}
                            </span>
                          </td>
                          <td className="truncate w-1/5 lg:pl-32">
                            <div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(timestamp: number) {
  return moment(timestamp * 1000).fromNow();
}
