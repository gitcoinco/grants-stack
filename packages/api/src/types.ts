/***************/
/* = General = */
/***************/

export enum ChainId {
  GOERLI = "5",
  OPTIMISM_MAINNET = "10",
  FANTOM_MAINNET = "250",
  FANTOM_TESTNET = "4002",
  LOCAL_ROUND_LAB = "3", // TODO: remove this later
}

export type Results = {
  distribution: ProjectMatch[];
  hasSaturated?: boolean;
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
  token: string;
  totalPot: number;
};

export type CalculateParam = {
  chainId: ChainId;
  roundId: string;
};

/****************/
/* = LinearQF = */
/****************/

export type QFContribution = {
  projectId: string;
  amount: number;
  contributor: string;
  timestamp?: number;
};

export type QFContributionsByProjectId = {
  [projectId: string]: {
    contributions: {
      [contributor: string]: QFContribution;
    };
  };
};
