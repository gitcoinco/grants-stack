import { useMemo } from "react";
import { Address, getAddress } from "viem";
import _ from "lodash";

import { Contribution, useDataLayer } from "data-layer";
import { dateToEthereumTimestamp } from "common";

import type { ContributionsData } from "../types";
import { calculateTotalContributions } from "../utils/calculateTotalContributions";
import { getContributionRoundStatus } from "../utils/getCountributionRoundStatus";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

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
      const result = _.cloneDeep(acc);

      const processedContribution = processContribution(contribution);
      const roundStatus = processedContribution.contributionRoundStatus;
      const roundId = processedContribution.roundId;
      const transactionHash = processedContribution.transactionHash;

      result.contributions.push(processedContribution);
      result.contributionsById[contribution.id] = processedContribution;

      if (roundStatus === "direct") {
        result.contributionsToDirectGrants.push(processedContribution);
      } else {
        // Ensure the structure exists before inserting the processedContribution
        if (!result.contributionsByStatusAndHashAndRoundId[roundStatus]) {
          result.contributionsByStatusAndHashAndRoundId[roundStatus] = {};
        }

        if (
          !result.contributionsByStatusAndHashAndRoundId[roundStatus][
            transactionHash
          ]
        ) {
          result.contributionsByStatusAndHashAndRoundId[roundStatus][
            transactionHash
          ] = {};
        }

        if (
          !result.contributionsByStatusAndHashAndRoundId[roundStatus][
            transactionHash
          ][roundId]
        ) {
          result.contributionsByStatusAndHashAndRoundId[roundStatus][
            transactionHash
          ][roundId] = [];
        }

        result.contributionsByStatusAndHashAndRoundId[roundStatus][
          transactionHash
        ][roundId].push(processedContribution);
      }

      return result;
    },
    {
      contributions: [],
      contributionsById: {},
      contributionsByStatusAndHashAndRoundId: {},
      contributionsToDirectGrants: [],
    }
  );
};

export type ContributionsByDonorResponse = Omit<
  UseQueryResult<Contribution[], Error>,
  "data"
> & { data?: ContributionsData };

export const useContributionsByDonor = (
  chainIds: number[],
  rawAddress: string
): ContributionsByDonorResponse => {
  const dataLayer = useDataLayer();

  const { data, ...contributionsResponse } = useQuery({
    queryKey: ["donations", rawAddress.toLowerCase()],
    queryFn: () => {
      const address: Address = getAddress(rawAddress.toLowerCase());
      return dataLayer.getDonationsByDonorAddress({
        address,
        chainIds,
      });
    },
    enabled: !!rawAddress,
  });

  const {
    contributions,
    contributionsById,
    contributionsByStatusAndHashAndRoundId,
    contributionsToDirectGrants,
    totals,
  } = useMemo<Omit<ContributionsData, "chainIds">>(() => {
    const aggregatedContributions = aggregateContributions(data ?? []);
    const totals = calculateTotalContributions(
      aggregatedContributions.contributions
    );
    return { ...aggregatedContributions, totals };
  }, [data]);

  const contributionsData = {
    chainIds,
    contributions,
    contributionsById,
    contributionsByStatusAndHashAndRoundId,
    contributionsToDirectGrants,
    totals,
  };

  return {
    ...contributionsResponse,
    data: contributionsData,
  };
};
