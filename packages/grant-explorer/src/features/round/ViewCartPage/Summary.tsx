import { ChainId, useTokenPrice } from "common";
import React from "react";
import { PayoutToken } from "../../api/types";
import { CHAINS } from "../../api/utils";
import { formatUnits } from "viem";

type SummaryProps = {
  totalDonation: bigint;
  selectedPayoutToken: PayoutToken;
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
    <div className="flex flex-col">
      <div className="flex justify-between mt-4">
        <p>
          Your Contribution on {CHAINS[chainId].name}
          <img
            className={"inline max-w-[32px]"}
            alt={CHAINS[chainId].name}
            src={CHAINS[chainId].logo}
          />
        </p>
        <p>
          <span data-testid={"totalDonation"} className="mr-2">
            {formatUnits(totalDonation, selectedPayoutToken.decimal)}
          </span>
          <span data-testid={"summaryPayoutToken"}>
            {selectedPayoutToken.name}
          </span>
        </p>
      </div>
      {payoutTokenPrice && (
        <div className="flex flex-row-reverse mt-2">
          <p className="text-[14px] text-grey-400">
            $ {totalDonationInUSD?.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
