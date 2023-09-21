import { ChainId, useTokenPrice } from "common";
import React from "react";
import { VotingToken } from "../../api/types";
import { CHAINS } from "../../api/utils";
import { formatUnits } from "viem";

type SummaryProps = {
  totalDonation: bigint;
  selectedPayoutToken: VotingToken;
  chainId: ChainId;
};

export function Summary({
  selectedPayoutToken,
  totalDonation,
  chainId,
}: SummaryProps) {
  const { data: payoutTokenPrice } = useTokenPrice(
    selectedPayoutToken.redstoneTokenId
  );
  const totalDonationInUSD =
    payoutTokenPrice &&
    Number(formatUnits(totalDonation, selectedPayoutToken.decimal)) *
      Number(payoutTokenPrice);
  return (
    <div className="flex flex-row justify-between mt-2">
      <div className="flex flex-col">
        <p className="mb-2">Your contribution on</p>
        <p>
          <img
            className={"inline max-w-[32px] mr-2"}
            alt={CHAINS[chainId].name}
            src={CHAINS[chainId].logo}
          />
          {CHAINS[chainId].name}
        </p>
      </div>
      <div className="flex flex-col">
        <p>
          <span data-testid={"totalDonation"} className="mr-2">
            {formatUnits(totalDonation, selectedPayoutToken.decimal)}
          </span>
          <span data-testid={"summaryPayoutToken"}>
            {selectedPayoutToken.name}
          </span>
        </p>
        {payoutTokenPrice && (
          <div className="flex justify-end mt-2">
            <p className="text-[14px] text-grey-400">
              $ {totalDonationInUSD?.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
