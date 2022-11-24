/***************/
/* = General = */
/***************/

export enum ChainId {
  GOERLI_CHAIN_ID = "5",
  OPTIMISM_MAINNET_CHAIN_ID = "10",
  FANTOM_MAINNET_CHAIN_ID = "250",
  FANTOM_TESTNET_CHAIN_ID = "4002",
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
