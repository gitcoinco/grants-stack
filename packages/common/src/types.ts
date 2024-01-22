import { Round } from "data-layer";
import { AnyJson } from "./index";

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

function fun(j: AnyJson) {}

const mockSchemaQuestion: SchemaQuestion = {
  id: 1,
  title: "Example Question",
  type: "text", // Assuming "text" is a valid value for InputType
  required: true,
  hidden: false,
  choices: ["Option 1", "Option 2", "Option 3"], // Optional, can be omitted
  encrypted: true,
  fixed: false, // Optional, can be omitted
  metadataExcluded: true, // Optional, can be omitted
};

fun([mockSchemaQuestion]);

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
