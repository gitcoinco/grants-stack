import { useCallback } from "react";
import { Checkbox } from "@chakra-ui/react";
import { useDonateToGitcoin } from "../DonateToGitcoinContext";
import React from "react";
import { DonateToGitcoinContent } from "./components/DonateToGitcoinContent";

export type DonationDetails = {
  chainId: number;
  tokenAddress: string;
  amount: string;
};

type DonateToGitcoinProps = {
  totalAmount: string;
};

export const DonateToGitcoin = React.memo(
  ({ totalAmount }: DonateToGitcoinProps) => {
    const { isEnabled, setIsEnabled } = useDonateToGitcoin();

    const handleCheckboxChange = useCallback(
      (value: React.ChangeEvent<HTMLInputElement>) => {
        setIsEnabled(value.target.checked);
      },
      [setIsEnabled]
    );

    return (
      <div className="flex flex-col items-start gap-[9px] p-[9px] border-[0.75px] border-[#E3E3E3] rounded-[7.5px] bg-[#F5F4FE]">
        <div>
          <p className="flex items-center">
            <Checkbox
              className={`mr-2 ${!isEnabled ? "opacity-50" : ""}`}
              border={"1px"}
              borderRadius={"4px"}
              colorScheme="whiteAlpha"
              iconColor="black"
              size="lg"
              isChecked={isEnabled}
              onChange={handleCheckboxChange}
            />
            <img
              className="inline mr-2 w-5 h-5"
              alt="Gitcoin"
              src="/logos/gitcoin-gist-logo.svg"
            />
            <span className="text-[15px] font-medium font-inter text-black">
              Donate to Gitcoin
            </span>
          </p>
        </div>

        <DonateToGitcoinContent totalAmount={totalAmount} />
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.totalAmount === nextProps.totalAmount
);
