import { useCallback, useEffect, useState } from "react";
import { Address, getAddress } from "viem";

import { Contribution, useDataLayer } from "data-layer";
import { dateToEthereumTimestamp } from "common";

import type { ContributionsData } from "../types";
import { calculateTotalContributions } from "../utils/calculateTotalContributions";
import { getContributionRoundStatus } from "../utils/getCountributionRoundStatus";

export type ContributionHistoryState = {
  status: "success" | "error" | "loading";
  data?: ContributionsData;
  error?: string;
};

const processContribution = (contribution: Contribution) => {
  const timestamp = dateToEthereumTimestamp(
    new Date(contribution.timestamp)
  ).toString();
  const contributionRoundStatus = getContributionRoundStatus(contribution);
  return { ...contribution, timestamp, contributionRoundStatus };
};

const aggregateContributions = (contributions: Contribution[]) => {
  return contributions.reduce<{
    contributions: ContributionsData["contributions"];
    contributionsById: ContributionsData["contributionsById"];
    contributionsByStatusAndHashAndRoundId: ContributionsData["contributionsByStatusAndHashAndRoundId"];
    contributionsToDirectGrants: ContributionsData["contributionsToDirectGrants"];
  }>(
    (acc, contribution) => {
      const processedContribution = processContribution(contribution);

      acc.contributions.push(processedContribution);

      acc.contributionsById[contribution.id] = processedContribution;

      const roundStatus = processedContribution.contributionRoundStatus;
      const roundId = processedContribution.roundId;
      const transactionHash = processedContribution.transactionHash;

      if (roundStatus === "direct") {
        acc.contributionsToDirectGrants.push(processedContribution);
      } else {
        acc.contributionsByStatusAndHashAndRoundId = {
          ...acc.contributionsByStatusAndHashAndRoundId,
          [roundStatus]: {
            ...acc.contributionsByStatusAndHashAndRoundId[roundStatus],
            [transactionHash]: {
              ...acc.contributionsByStatusAndHashAndRoundId[roundStatus]?.[
                transactionHash
              ],
              [roundId]: [
                ...(acc.contributionsByStatusAndHashAndRoundId[roundStatus]?.[
                  transactionHash
                ]?.[roundId] || []),
                processedContribution,
              ],
            },
          },
        };
      }

      return acc;
    },
    {
      contributions: [],
      contributionsById: {},
      contributionsByStatusAndHashAndRoundId: {},
      contributionsToDirectGrants: [],
    }
  );
};

export const useContributionsByDonor = (
  chainIds: number[],
  rawAddress: string
): ContributionHistoryState => {
  const [state, setState] = useState<ContributionHistoryState>({
    status: "loading",
  });

  const dataLayer = useDataLayer();

  const fetchContributions = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const address: Address = getAddress(rawAddress.toLowerCase());
      const contributionsResponse = await dataLayer.getDonationsByDonorAddress({
        address,
        chainIds,
      });

      const {
        contributions,
        contributionsById,
        contributionsByStatusAndHashAndRoundId,
        contributionsToDirectGrants,
      } = aggregateContributions(contributionsResponse);

      const totals = calculateTotalContributions(contributions);

      const contributionsData: ContributionsData = {
        chainIds,
        contributions,
        totals,
        contributionsById,
        contributionsByStatusAndHashAndRoundId,
        contributionsToDirectGrants,
      };

      setState({
        status: "success",
        data: contributionsData,
      });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [chainIds, dataLayer, rawAddress]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  return state;
};
