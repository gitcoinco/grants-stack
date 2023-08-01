import { BigNumber, ethers } from "ethers";
import React from "react";
import { PayoutToken } from "../../api/types";

type SummaryProps = {
  payoutTokenPrice: number;
  totalDonation: BigNumber;
  selectedPayoutToken: PayoutToken;
};

export function Summary({
  payoutTokenPrice,
  selectedPayoutToken,
  totalDonation,
}: SummaryProps) {
  const totalDonationInUSD =
    payoutTokenPrice &&
    Number(
      ethers.utils.formatUnits(totalDonation, selectedPayoutToken.decimal)
    ) * Number(payoutTokenPrice.toFixed(2));

  return (
    <div className="shrink mb-5 block px-[16px] py-4 rounded-lg shadow-lg bg-white border border-violet-400 font-semibold">
      <h2 className="text-xl border-b-2 pb-2">Summary</h2>
      <div className="flex justify-between mt-4">
        <p>Your Contribution</p>
        <p>
          <span data-testid={"totalDonation"} className="mr-2">
            {ethers.utils.formatUnits(
              totalDonation,
              selectedPayoutToken.decimal
            )}
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
