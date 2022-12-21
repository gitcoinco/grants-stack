/***************/
/* = General = */
/***************/

import {BigNumber} from "ethers";

export enum ChainId {
  MAINNET = "1",
  GOERLI = "5",
  OPTIMISM_MAINNET = "10",
  FANTOM_MAINNET = "250",
  FANTOM_TESTNET = "4002",
  LOCAL_ROUND_LAB = "3",
}

export type MetaPtr = {
  protocol: number;
  pointer: string;
};

export type Results = {
  distribution: any;
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


export type ProjectSummary = {
  contributors: string[];
  contributions: [];
}

export type Map = {
  [id: string]: string;
}

export type HandleResponseObject = {
  success: boolean;
  message: string;
  data: object;
}

/****************/
/* = LinearQF = */
/****************/

export type ChainName = "ethereum" | "optimistic-ethereum" | "fantom";

export type DenominationResponse = {
  amount: number;
  isSuccess: boolean;
  message: string | Error;
}

export type QFContribution = {
  amount: BigNumber;
  token: string;
  contributor: string;
  projectId: string;
};

export type QFContributionSummary = {
  contributionCount: number;
  uniqueContributors: number;
  totalContributionsInUSD?: number;
  averageUSDContribution?: number;
  projects?: any;
};