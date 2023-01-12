/***************/
/* = General = */
/***************/

import { BigNumber } from "ethers";

export enum ChainId {
  MAINNET = "1",
  GOERLI = "5",
  OPTIMISM_MAINNET = "10",
  FANTOM_MAINNET = "250",
  FANTOM_TESTNET = "4002",
  LOCAL_ROUND_LAB = "3",
}

export type Result = {
  error?: any;
  result: any;
};

export type MetaPtr = {
  protocol: number;
  pointer: string;
};

export type QFDistributionResults = {
  distribution: QFDistribution[];
  isSaturated?: boolean;
};

export type RoundMetadata = {
  votingStrategy: {
    id: string;
    strategyName: string;
  };
  projectsMetaPtr: MetaPtr;
  roundStartTime: number;
  roundEndTime: number;
  token: string;
  totalPot: number;
};

export type Map = {
  [id: string]: string;
};

export type HandleResponseObject = {
  success: boolean;
  message: string;
  data: object;
};

/****************/
/* = LinearQF = */
/****************/

export type ChainName = "ethereum" | "optimistic-ethereum" | "fantom";

export type DenominationResponse = {
  amount: number;
  isSuccess: boolean;
  message: string | Error;
};

export type QFContribution = {
  amount: BigNumber;
  token: string;
  contributor: string;
  projectId: string;
  projectPayoutAddress: string;
  usdValue?: number;
};

export type QFVotedEvent = {
  to: string;
  amount: string;
  token: string;
  from: string;
  id: string;
};

export type QFContributionSummary = {
  contributionCount: number;
  uniqueContributors: number;
  totalContributionsInUSD?: number;
  averageUSDContribution?: number;
};

export type QFDistribution = {
  projectId: string;
  matchAmountInUSD: number;
  totalContributionsInUSD: number;
  matchPoolPercentage: number;
  matchAmountInToken: number;
  projectPayoutAddress: string;
  uniqueContributorsCount: number;
};
