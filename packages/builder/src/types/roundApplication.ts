export interface RoundApplicationQuestion {
  id: number;
  question: string;
  type: string;
  required: boolean;
  info?: string;
  choices?: string[];
  encrypted?: boolean;
}

export type ProjectRequirements = {
  twitter: {
    required: boolean;
    verification: boolean;
  };
  github: {
    required: boolean;
    verification: boolean;
  };
};

export interface RoundApplicationMetadata {
  version: string;
  lastUpdatedOn: number;
  applicationSchema: {
    questions: RoundApplicationQuestion[];
    requirements: ProjectRequirements;
  };
  projectQuestionId?: number;
  recipientQuestionId?: number;
}
