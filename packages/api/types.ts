
/***************/
/* = General = */
/***************/

export type Results = {
  distribution: ProjectMatch[];
  hasSaturated?: boolean
}

export type ProjectMatch = {
  projectId: string;
  match: number;
};


export type RoundMetadata = {
  votingStrategyName: string;
  token: string;
  totalPot: number;
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