import { dateToEthereumTimestamp } from "common";
import { Contribution } from "data-layer";
import { ContributionRoundStatus } from "../types";

export const getContributionRoundStatus = (
  contribution: Contribution
): ContributionRoundStatus => {
  if (contribution.round.strategyName === "allov2.DirectAllocationStrategy") {
    return "direct";
  }

  const now = Date.now();

  const formattedRoundEndTime =
    Number(
      dateToEthereumTimestamp(new Date(contribution.round.donationsEndTime))
    ) * 1000;

  if (formattedRoundEndTime >= now) {
    return "active";
  } else {
    return "past";
  }
};
