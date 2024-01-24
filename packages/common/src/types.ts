import { Round } from "data-layer";

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
