import { useMemo, useCallback } from "react";
import { Checkbox } from "@chakra-ui/react";
import { useDonateToGitcoin } from "../DonateToGitcoinContext";
import React from "react";
import { DonateToGitcoinContent } from "./components/DonateToGitcoinContent";

type TokenFilter = {
  chainId: number;
  addresses: string[];
};

export type DonationDetails = {
  chainId: number;
  tokenAddress: string;
  amount: string;
};

type DonateToGitcoinProps = {
  divider?: "none" | "top" | "bottom";
  tokenFilters?: TokenFilter[];
};

export const DonateToGitcoin = React.memo(
  ({ divider = "none" }: DonateToGitcoinProps) => {
    const { isEnabled, setIsEnabled } = useDonateToGitcoin();

    const handleCheckboxChange = useCallback(
      (value: React.ChangeEvent<HTMLInputElement>) => {
        setIsEnabled(value.target.checked);
      },
      [setIsEnabled]
    );

    const borderClass = useMemo(() => {
      switch (divider) {
        case "top":
          return "border-t";
        case "bottom":
          return "border-b";
        default:
          return "";
      }
    }, [divider]);

    return (
      <div className={`flex flex-col justify-center mt-2 py-4 ${borderClass}`}>
        <div className={`${!isEnabled ? "opacity-50" : ""}`}>
          <p className="font-sans font-medium flex items-center">
            <Checkbox
              className="mr-2"
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
            <span className="font-sans font-medium">Donate to Gitcoin</span>
          </p>
        </div>

        <DonateToGitcoinContent />
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.divider === nextProps.divider
);
