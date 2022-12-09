/***************/
/* = General = */

/***************/

export enum ChainId {
  MAINNET = "1",
  GOERLI = "5",
  OPTIMISM_MAINNET = "10",
  FANTOM_MAINNET = "250",
  FANTOM_TESTNET = "4002",
  LOCAL_ROUND_LAB = "3", // TODO: remove this later
}

export type Results = {
  distribution: ProjectMatch[];
  isSaturated?: boolean;
};

export type ProjectMatch = {
  projectId: string;
  amount: number;
  token: string;
};

export type RoundMetadata = {
  votingStrategy: {
    id: string;
    strategyName: string;
  };
  roundStartTime: number;
  roundEndTime: number;
  token: string;
  totalPot: number;
};

export type CalculateParam = {
  chainId: ChainId;
  roundId: string;
};

export type RoundStats = {
  uniqueContributorCount: number,
  contributionsCount: number,
  totalContributionsInUSD: number;
}

export type HandleResponseObject = {
  success: boolean;
  message: string;
  data: object;
}

/****************/
/* = LinearQF = */
/****************/

export type QFContribution = {
  projectId: string;
  amount: number;
  contributor: string;
  timestamp?: number;
  token: string;
};

export type QFContributionsByProjectId = {
  [projectId: string]: {
    contributions: {
      [contributor: string]: QFContribution;
    };
  };
};

export type ChainName = "ethereum" | "optimistic-ethereum" | "fantom";

export type DenominationResponse = {
  amount: number;
  isSuccess: boolean;
  message: string | Error;
}

