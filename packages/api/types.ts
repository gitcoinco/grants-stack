/***************/
/* = General = */
/***************/

export enum ChainId {
  GOERLI_CHAIN_ID = "5",
  OPTIMISM_MAINNET_CHAIN_ID = "10",
  FANTOM_MAINNET_CHAIN_ID = "250",
  FANTOM_TESTNET_CHAIN_ID = "4002",
  LOCAL_ROUND_LAB = "3", // TODO: remove this later
}

export type Results = {
  distribution: ProjectMatch[];
  hasSaturated?: boolean;
};

export type ProjectMatch = {
  projectId: string;
  match: number;
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
}

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
