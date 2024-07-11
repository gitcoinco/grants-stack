import { Round } from "data-layer";
import { AnyJson } from ".";
import { BigNumber } from "ethers";

export type CreateRoundData = {
  roundMetadataWithProgramContractAddress: Round["roundMetadata"];
  applicationQuestions: {
    version: string;
    lastUpdatedOn: number;
    applicationSchema: {
      questions: SchemaQuestion[];
      requirements: ProjectRequirements;
    };
  };
  round: Round;
  roundCategory: RoundCategory;
};

export type UpdateRoundParams = {
  applicationMetadata?: AnyJson;
  roundMetadata?: AnyJson;
  matchAmount?: BigNumber;
  roundStartTime?: Date;
  roundEndTime?: Date;
  applicationsStartTime?: Date;
  applicationsEndTime?: Date;
};

export type MatchingStatsData = {
  index?: number;
  projectName: string;
  uniqueContributorsCount?: number;
  contributionsCount: number;
  matchPoolPercentage: number;
  projectId: string;
  applicationId: string;
  anchorAddress?: string;
  matchAmountInToken: BigNumber;
  originalMatchAmountInToken: BigNumber;
  projectPayoutAddress: string;
  status?: string;
  hash?: string;
};

export type SchemaQuestion = {
  id: number;
  title: string;
  type: InputType;
  required: boolean;
  hidden: boolean;
  choices?: string[];
  encrypted: boolean;
  fixed?: boolean;
  metadataExcluded?: boolean;
};

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

export enum RoundCategory {
  QuadraticFunding,
  Direct,
}

export enum UpdateAction {
  UPDATE_APPLICATION_META_PTR = "updateApplicationMetaPtr",
  UPDATE_ROUND_META_PTR = "updateRoundMetaPtr",
  UPDATE_ROUND_START_AND_END_TIMES = "updateStartAndEndTimes",
  UPDATE_MATCH_AMOUNT = "updateMatchAmount",
  UPDATE_ROUND_FEE_ADDRESS = "updateRoundFeeAddress",
  UPDATE_ROUND_FEE_PERCENTAGE = "updateRoundFeePercentage",
}

export type InputType =
  | "email"
  | "address"
  | "number"
  | "text"
  | "short-answer"
  | "paragraph"
  | "multiple-choice"
  | "checkbox"
  | "dropdown"
  | "link";

export type DeepRequired<T> = {
  [K in keyof T]: Required<DeepRequired<T[K]>>;
};

export type Allocation = {
  profileOwner: `0x${string}`;
  amount: bigint;
  token: `0x${string}`;
  nonce: bigint;
};
