import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/react";
import { useState } from "react";
import { Hex, formatUnits } from "viem";

import { Contribution } from "data-layer";
import {
  getChainById,
  getTokenByChainIdAndAddress,
  stringToBlobUrl,
} from "common";

import { RoundAccordionPanel } from "./RoundAccordionPanel";
import { RoundAccordionTitle } from "./RoundAccordionTitle";

export function RoundAccordion({
  contributions,
}: {
  contributions: Contribution[];
}) {
  const [defaultIndex, setDefaultIndex] = useState<
    number | number[] | undefined
  >(undefined);

  const sortedContributions = contributions.sort(
    (a, b) => b.amountInUsd - a.amountInUsd // Sort by amountInUsd in descending order
  );

  const firstContribution = sortedContributions[0];
  const chainId = firstContribution.chainId;
  const chain = getChainById(chainId);
  const chainLogo = stringToBlobUrl(chain.icon);
  const roundId = firstContribution.roundId;
  const roundName = firstContribution.round.roundMetadata.name;
  const lastUpdated = firstContribution.timestamp;

  let formattedAmount = "N/A";
  let totalContributionAmountInUsd = 0;
  let totalContributionInMatchingToken = 0;

  // Get the total contribution amount in USD and matching token
  // Get the formatted amount & token name
  sortedContributions.map((contribution) => {
    totalContributionAmountInUsd += contribution.amountInUsd;
    totalContributionInMatchingToken += Number(contribution.amount);
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

  return (
    <Accordion
      className="w-full"
      allowMultiple={true}
      defaultIndex={defaultIndex}
      onChange={(index) => {
        setDefaultIndex(index);
      }}
    >
      <AccordionItem isDisabled={sortedContributions.length === 0}>
        <h2>
          <AccordionButton
            _expanded={{
              bg: "white",
              color: "black",
            }}
            _hover={{ bg: "white", color: "black" }}
            _disabled={{ bg: "white", color: "black" }}
          >
            <RoundAccordionTitle
              {...{
                chainLogo,
                roundName,
                chainId,
                roundId,
                lastUpdated,
                formattedAmount,
                totalContributionAmountInUsd,
              }}
            />
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={0} px={0}>
          <RoundAccordionPanel contributions={sortedContributions} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
