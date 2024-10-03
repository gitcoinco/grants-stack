import { Link } from "react-router-dom";
import { Hex, formatUnits } from "viem";
import moment from "moment";

import { getTokenByChainIdAndAddress } from "common";
import { Contribution } from "data-layer";

import { TransactionButton } from "./TransactionButton";

export function DirectDonationsList(props: { contributions: Contribution[] }) {
  const contributions = props.contributions
    .flat()
    .sort(
      (a, b) =>
        (Number(b.timestamp) || Number.MAX_SAFE_INTEGER) -
        (Number(a.timestamp) || Number.MAX_SAFE_INTEGER)
    );
  return (
    <>
      {contributions.length > 0 &&
        contributions.map((contribution) => {
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
            <div className="w-full flex items-center px-4 justify-between font-modern-era-regular font-normal text-base/[26px]">
              <div className="flex flex-col gap-1 flex-1">
                <Link
                  className={`underline inline-block lg:pr-2 lg:max-w-[300px] max-w-[75px] 2xl:max-w-fit truncate`}
                  title={contribution.projectId}
                  to={`/projects/${contribution.projectId}`}
                  target="_blank"
                >
                  {contribution.application?.project?.name ??
                    `Project Id: ${contribution.projectId.slice(0, 6) + "..." + contribution.projectId.slice(-6)}`}
                </Link>
                {/* Display contribution timestamp */}
                <div className="text-sm text-gray-500">
                  {timeAgo(Number(contribution.timestamp))}
                </div>
              </div>
              <div className="flex-1 text-center truncate">
                <span>{formattedAmount} </span>
                <span className="text-grey-400">
                  / ${contribution.amountInUsd.toFixed(2)}
                </span>
              </div>
              <div className="flex-1 flex justify-end">
                <TransactionButton
                  chainId={contribution.chainId}
                  txHash={contribution.transactionHash}
                />
              </div>
            </div>
          );
        })}
    </>
  );
}

function timeAgo(timestamp: number) {
  return moment(timestamp * 1000).fromNow();
}
