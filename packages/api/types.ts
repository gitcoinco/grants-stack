export type Contribution = {
  projectId: string;
  amount: number;
  contributor: string;
  timestamp?: number;
};

export type ContributionsByProjectId = {
  [projectId: string]: {
    contributions: {
      [contributor: string]: Contribution;
    };
  };
};

export type ProjectMatch = {
  projectId: string;
  match: number;
};