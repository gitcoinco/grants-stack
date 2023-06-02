import { Round } from "./api/types";
import { cloneDeep } from "lodash";

export type RoundForm = Round & {
  roundMetadata: {
    quadraticFundingConfig: {
      enableMatchingCap: boolean;
      enableMinContribution: boolean;
    };
  };
};

// Build Round form model from a Round object
export function buildRoundForm(round: Round): RoundForm {
  return cloneDeep<RoundForm>({
    ...round,
    roundMetadata: {
      ...round.roundMetadata,
      quadraticFundingConfig: {
        ...round.roundMetadata.quadraticFundingConfig,
        enableMatchingCap: Boolean(
          round.roundMetadata.quadraticFundingConfig.matchingCapPercentage
        ),
        enableMinContribution: Boolean(
          round.roundMetadata.quadraticFundingConfig.minContributionUSD
        ),
      },
    },
  });
}

export function buildRound(round: RoundForm): Round {
  return {
    ...round,
    roundMetadata: {
      ...round.roundMetadata,
      quadraticFundingConfig: {
        matchAmount: round.roundMetadata.quadraticFundingConfig.matchAmount,
        minContributionUSD: round.roundMetadata.quadraticFundingConfig
          .enableMinContribution
          ? round.roundMetadata.quadraticFundingConfig.minContributionUSD
          : undefined,
        matchingCapPercentage: round.roundMetadata.quadraticFundingConfig
          .enableMatchingCap
          ? round.roundMetadata.quadraticFundingConfig.matchingCapPercentage
          : undefined,
      },
    },
  };
}
