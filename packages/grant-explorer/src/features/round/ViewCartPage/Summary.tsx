import { ChainId, useTokenPrice } from "common";
import { BigNumber, ethers } from "ethers";
import React, { useState } from "react";
import { PayoutToken } from "../../api/types";
import { CHAINS } from "../../api/utils";

type SummaryProps = {
  totalDonation: BigNumber;
  selectedPayoutToken: PayoutToken;
  chainId: ChainId;
  chainIdBeingCheckedOut: ChainId;
  setChainIdBeingCheckedOut: React.Dispatch<React.SetStateAction<ChainId>>;
};

export function Summary({
  selectedPayoutToken,
  totalDonation,
  chainId,
  chainIdBeingCheckedOut,
  setChainIdBeingCheckedOut,
}: SummaryProps) {
  const { data: payoutTokenPrice } = useTokenPrice(
    selectedPayoutToken.redstoneTokenId
  );
  const totalDonationInUSD =
    payoutTokenPrice &&
    Number(
      ethers.utils.formatUnits(totalDonation, selectedPayoutToken.decimal)
    ) * Number(payoutTokenPrice);
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    !isChecked && setChainIdBeingCheckedOut(chainId);
    isChecked && setChainIdBeingCheckedOut(1);
  };
  return (
    <div className="flex flex-col">
      <div className="flex justify-between mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 rounded-sm"
            checked={isChecked && chainId === chainIdBeingCheckedOut}
            onChange={handleCheckboxChange}
          />
          <p>
            Your Contribution on {CHAINS[chainId].name}
            <img
              className="inline-block w-6 h-6 ml-2"
              alt={CHAINS[chainId].name}
              src={CHAINS[chainId].logo}
            />
          </p>
        </label>
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
